import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { SOCKET_URL } from "../lib/config.js";
import {
  agentReducer,
  createPacket,
  initialAgentState,
} from "./agentReducer.js";

const COACH_ACK_TIMEOUT_MS = 6000;
const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const [state, dispatch] = useReducer(agentReducer, initialAgentState);
  const socketRef = useRef(null);
  const wasConnectedRef = useRef(false);
  const lastShotRef = useRef(null);
  const coachTimeoutRef = useRef(null);

  const clearCoachTimeout = useCallback(() => {
    if (coachTimeoutRef.current) {
      clearTimeout(coachTimeoutRef.current);
      coachTimeoutRef.current = null;
    }
  }, []);

  const startCoachTimeout = useCallback(() => {
    clearCoachTimeout();
    coachTimeoutRef.current = setTimeout(() => {
      dispatch({ type: "COACH_TIMEOUT", payload: "connection lost, retry" });
    }, COACH_ACK_TIMEOUT_MS);
  }, [clearCoachTimeout]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    const onConnect = () => {
      wasConnectedRef.current = true;
      dispatch({ type: "SOCKET_CONNECTED" });
      toast.success("Connected to broker", { description: "Live telemetry active." });
    };

    const onDisconnect = () => {
      dispatch({ type: "SOCKET_DISCONNECTED" });
      if (wasConnectedRef.current) {
        toast.error("Broker connection lost", {
          description: "Live telemetry stream interrupted. Reconnecting…",
        });
      }
    };

    const onConnectError = () => {
      toast.error("Unable to reach broker", {
        description: "Socket.io connection to the event broker failed.",
      });
    };

    const onPacket = (data) => {
      clearCoachTimeout();
      dispatch({ type: "PACKET_RECEIVED", payload: createPacket(data) });
    };

    const onShotError = (data) => {
      clearCoachTimeout();
      const message = data?.message ?? data?.error ?? "compute_shot failed";
      dispatch({ type: "SHOT_ERROR", payload: message });
    };

    const onShotAck = (data) => {
      const withCoach = lastShotRef.current?.with_coach ?? false;
      if (withCoach && data?.status === "accepted") {
        startCoachTimeout();
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("agent_state_update", onPacket);
    socket.on("compute_shot_error", onShotError);
    socket.on("compute_shot_ack", onShotAck);

    return () => {
      clearCoachTimeout();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("agent_state_update", onPacket);
      socket.off("compute_shot_error", onShotError);
      socket.off("compute_shot_ack", onShotAck);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [clearCoachTimeout, startCoachTimeout]);

  const clearPackets = useCallback(() => {
    dispatch({ type: "CLEAR_PACKETS" });
  }, []);

  const resetShot = useCallback(() => {
    clearCoachTimeout();
    dispatch({ type: "RESET_SHOT" });
  }, [clearCoachTimeout]);

  const computeShot = useCallback((shot) => {
    clearCoachTimeout();
    lastShotRef.current = shot;
    dispatch({ type: "RESET_SHOT" });
    socketRef.current?.emit("compute_shot", shot);
  }, [clearCoachTimeout]);

  const value = useMemo(
    () => ({
      packets: state.packets,
      connected: state.connected,
      activeNodeId: state.activeNodeId,
      flaggedEdgeIds: state.flaggedEdgeIds,
      errorNodeIds: state.errorNodeIds,
      vectorData: state.vectorData,
      shotSolution: state.shotSolution,
      stage: state.stage,
      coachNarrative: state.coachNarrative,
      shotError: state.shotError,
      coachTimeoutError: state.coachTimeoutError,
      clearPackets,
      computeShot,
      resetShot,
    }),
    [
      state.packets,
      state.connected,
      state.activeNodeId,
      state.flaggedEdgeIds,
      state.errorNodeIds,
      state.vectorData,
      state.shotSolution,
      state.stage,
      state.coachNarrative,
      state.shotError,
      state.coachTimeoutError,
      clearPackets,
      computeShot,
      resetShot,
    ],
  );

  return (
    <AgentContext.Provider value={value}>
      {(state.shotError || state.coachTimeoutError) && (
        <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200">
          {state.shotError ?? state.coachTimeoutError}
        </div>
      )}
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error("useAgent must be used within AgentProvider");
  }
  return ctx;
}
