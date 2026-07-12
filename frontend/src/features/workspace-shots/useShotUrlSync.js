import { useCallback, useEffect, useRef } from "react";
import { useAgent } from "../../context/AgentProvider.jsx";
import {
  dispatchShotHydrate,
  parseShotFromSearch,
  replaceShotUrl,
} from "../../lib/shotUrl.js";

export function useShotUrlSync() {
  const { shotSolution, computeShot, clearPackets } = useAgent();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    const shot = parseShotFromSearch(window.location.search);
    if (!shot) return;
    hydratedRef.current = true;
    dispatchShotHydrate(shot);
    clearPackets();
    // Deep-linked shots (drills, shared links) get the full coach treatment —
    // the instant deterministic draft makes this free.
    computeShot({ ...shot, with_coach: true });
  }, [computeShot, clearPackets]);

  useEffect(() => {
    if (!shotSolution?.cue_ball) return;
    replaceShotUrl(shotSolution);
  }, [shotSolution]);

  return { shotSolution };
}
