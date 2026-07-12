import { TABLE } from "../config/billiardsPresets.js";

const LINE_IDS = new Set(["aim", "object", "tangent"]);
const BALL_IDS = new Set(["cue", "object", "ghost"]);

export function partitionVectorData(vectorData) {
  const lines = [];
  const balls = [];
  for (const v of vectorData) {
    if (LINE_IDS.has(v.ball_id)) lines.push(v);
    if (BALL_IDS.has(v.ball_id)) balls.push(v);
  }
  return { lines, balls };
}

export function vectorById(vectorData, ballId) {
  return vectorData.find((v) => v.ball_id === ballId) ?? null;
}

export function warnOutOfBounds(vectorData) {
  for (const v of vectorData) {
    for (const label of ["start", "end"]) {
      const pt = v[label];
      if (!pt) continue;
      if (pt.x < 0 || pt.x > TABLE.w || pt.y < 0 || pt.y > TABLE.h) {
        console.warn(
          `[BilliardsTable] ${v.ball_id}.${label} out of bounds [0,${TABLE.w}]×[0,${TABLE.h}]:`,
          pt,
        );
      }
    }
  }
}
