import { useCallback, useEffect, useReducer } from "react";
import { POCKETS, TABLE } from "../config/billiardsPresets.js";

export const INITIAL_AIM = { step: 0, cue_ball: null, object_ball: null, pocket: null };

export const STEP_GUIDES = [
  "Step 1 of 3: Tap to place the cue ball",
  "Step 2 of 3: Tap to place the object ball",
  "Step 3 of 3: Tap a pocket to aim at",
];

function clonePt(p) {
  return { x: p.x, y: p.y };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function nearestPocket(pt) {
  let best = POCKETS[0];
  let bestD = Infinity;
  for (const p of POCKETS) {
    const d = dist(pt, p);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return clonePt(best);
}

function snapPocket(pt) {
  const SNAP_R = 2.5;
  let best = null;
  let bestD = SNAP_R;
  for (const p of POCKETS) {
    const d = dist(pt, p);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best ? clonePt(best) : nearestPocket(pt);
}

function aimReducer(state, action) {
  switch (action.type) {
    case "CLICK": {
      const pt = clonePt(action.point);
      if (state.step === 0) {
        return { step: 1, cue_ball: pt, object_ball: null, pocket: null };
      }
      if (state.step === 1) {
        return { step: 2, cue_ball: state.cue_ball, object_ball: pt, pocket: null };
      }
      if (state.step === 2) {
        const pocket = snapPocket(action.point);
        return {
          step: 3,
          cue_ball: state.cue_ball,
          object_ball: state.object_ball,
          pocket,
          pendingShot: {
            cue_ball: clonePt(state.cue_ball),
            object_ball: clonePt(state.object_ball),
            pocket: clonePt(pocket),
          },
        };
      }
      return state;
    }
    case "SET_POSITIONS": {
      return {
        ...state,
        step: action.pocket ? 3 : action.object_ball ? 2 : action.cue_ball ? 1 : 0,
        cue_ball: action.cue_ball ? clonePt(action.cue_ball) : state.cue_ball,
        object_ball: action.object_ball ? clonePt(action.object_ball) : state.object_ball,
        pocket: action.pocket ? clonePt(action.pocket) : state.pocket,
        pendingShot: undefined,
      };
    }
    case "UNDO": {
      if (state.step === 2) {
        return { step: 1, cue_ball: state.cue_ball, object_ball: null, pocket: null };
      }
      if (state.step === 1) {
        return { ...INITIAL_AIM };
      }
      return state;
    }
    case "RESET":
      return { ...INITIAL_AIM };
    case "CLEAR_PENDING":
      return { ...state, pendingShot: undefined };
    default:
      return state;
  }
}

/** Map tap pixel coordinates to 36×18 physics space using rendered bounds. */
export function pixelToTableCoords(clientX, clientY, rect) {
  const x = ((clientX - rect.left) / rect.width) * TABLE.w;
  const y = ((clientY - rect.top) / rect.height) * TABLE.h;
  return {
    x: Math.max(0, Math.min(TABLE.w, x)),
    y: Math.max(0, Math.min(TABLE.h, y)),
  };
}

export function useAimClickSequence() {
  const [aim, dispatch] = useReducer(aimReducer, INITIAL_AIM);

  const handleTableClick = useCallback((point) => {
    dispatch({ type: "CLICK", point });
  }, []);

  const setPositions = useCallback((positions) => {
    dispatch({ type: "SET_POSITIONS", ...positions });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const clearPending = useCallback(() => {
    dispatch({ type: "CLEAR_PENDING" });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  return {
    aim,
    stepGuide: STEP_GUIDES[aim.step] ?? STEP_GUIDES[0],
    handleTableClick,
    setPositions,
    reset,
    clearPending,
    undo,
  };
}

export function usePendingShotEffect(aim, onPendingShot, withCoach = false) {
  useEffect(() => {
    if (!aim.pendingShot) return;
    onPendingShot({ ...aim.pendingShot, with_coach: withCoach });
  }, [aim.pendingShot, onPendingShot, withCoach]);
}
