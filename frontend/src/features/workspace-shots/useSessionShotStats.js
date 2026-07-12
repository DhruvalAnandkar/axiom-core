import { useEffect, useRef, useState } from "react";
import { cutDifficultyTag } from "../../lib/shotVerdict.js";

function shotKey(sol) {
  if (!sol?.cue_ball) return null;
  const { cue_ball: c, object_ball: o, pocket: p } = sol;
  return `${c.x},${c.y}|${o.x},${o.y}|${p.x},${p.y}`;
}

export function useSessionShotStats(shotSolution) {
  const [cuts, setCuts] = useState([]);
  const lastKeyRef = useRef(null);

  useEffect(() => {
    const key = shotKey(shotSolution);
    if (!key || key === lastKeyRef.current) return;
    if (shotSolution.cut_angle_deg == null) return;
    lastKeyRef.current = key;
    setCuts((prev) => [...prev, shotSolution.cut_angle_deg]);
  }, [shotSolution]);

  const count = cuts.length;
  if (!count) {
    return { count: 0, avgLabel: "—" };
  }

  const avgCut = cuts.reduce((a, b) => a + b, 0) / count;
  const avgLabel = cutDifficultyTag({ cut_angle_deg: avgCut })?.label ?? "—";

  return { count, avgLabel };
}
