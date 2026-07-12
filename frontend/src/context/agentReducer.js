const LOOP_EDGE_ID = "loop-critic-draftsman";

export const initialAgentState = {
  packets: [],
  connected: false,
  activeNodeId: null,
  flaggedEdgeIds: [],
  errorNodeIds: [],
  vectorData: [],
  shotSolution: null,
  stage: null,
  coachNarrative: null,
  shotError: null,
  coachTimeoutError: null,
};

function uniquePush(list, value) {
  return list.includes(value) ? list : [...list, value];
}

function resolveActiveNode(packet) {
  if (packet.status === "running") return packet.node_id;
  if (packet.status === "rejected") return "draftsman";
  if (
    packet.status === "completed" ||
    packet.status === "approved" ||
    packet.status === "error"
  ) {
    return packet.node_id;
  }
  return null;
}

export function agentReducer(state, action) {
  switch (action.type) {
    case "SOCKET_CONNECTED":
      return { ...state, connected: true };

    case "SOCKET_DISCONNECTED":
      return { ...state, connected: false };

    case "PACKET_RECEIVED": {
      const packet = action.payload;
      const activeNodeId = resolveActiveNode(packet) ?? state.activeNodeId;

      let flaggedEdgeIds = state.flaggedEdgeIds;
      let errorNodeIds = state.errorNodeIds;

      if (packet.status === "rejected") {
        flaggedEdgeIds = uniquePush(flaggedEdgeIds, LOOP_EDGE_ID);
      }

      if (packet.status === "error") {
        errorNodeIds = uniquePush(errorNodeIds, packet.node_id);
        const inboundId = `flow-${inboundSource(packet.node_id)}-${packet.node_id}`;
        if (inboundSource(packet.node_id)) {
          flaggedEdgeIds = uniquePush(flaggedEdgeIds, inboundId);
        }
      }

      const payload = packet.payload ?? {};
      const vectorData = payload.vector_data ?? state.vectorData;
      const shotSolution = payload.shot_solution ?? state.shotSolution;
      const stage = payload.stage ?? state.stage;
      const coachNarrative =
        payload.coach_narrative ??
        payload.draft_narrative ??
        state.coachNarrative;

      return {
        ...state,
        packets: [...state.packets, packet],
        activeNodeId,
        flaggedEdgeIds,
        errorNodeIds,
        vectorData,
        shotSolution,
        stage,
        coachNarrative,
        coachTimeoutError: null,
      };
    }

    case "CLEAR_PACKETS":
      return {
        ...initialAgentState,
        connected: state.connected,
      };

    case "RESET_SHOT":
      return {
        ...state,
        vectorData: [],
        shotSolution: null,
        stage: null,
        coachNarrative: null,
        shotError: null,
        coachTimeoutError: null,
      };

    case "SHOT_ERROR":
      return { ...state, shotError: action.payload };

    case "COACH_TIMEOUT":
      return { ...state, coachTimeoutError: action.payload };

    default:
      return state;
  }
}

function inboundSource(nodeId) {
  if (nodeId === "draftsman") return "researcher";
  if (nodeId === "critic") return "draftsman";
  return null;
}

export function createPacket(raw) {
  return {
    node_id: raw.node_id,
    agent_name: raw.agent_name,
    status: raw.status,
    message: raw.message,
    payload: raw.payload ?? {},
    id: `${raw.node_id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    receivedAt: new Date().toISOString(),
  };
}
