/**
 * Deterministic post-contact cue-ball trajectory approximation (frontend only —
 * the engine's ghost-ball/tangent solution is untouched and remains the source
 * of truth for the object ball).
 *
 * Model (standard billiards instruction, e.g. Dr. Dave's trajectory rules):
 * - Stun (center hit): cue departs along the tangent line — the component of
 *   the aim direction perpendicular to the object-ball line, magnitude sin(cut).
 * - Follow (hit above center): adds a roll component along the original aim
 *   line, bending the path forward of the tangent.
 * - Draw (hit below center): the roll component reverses, bending it backward.
 * - Side english: aggregated squirt/swerve approximated as a small rotation of
 *   the departure direction (±12° at full tip offset).
 * - Cushions: the sampled trajectory reflects off the rails (with the ball
 *   radius as margin), so follow/draw shots bank realistically.
 * Straight-in + stun = stop shot (no departure).
 */

import { POCKETS, TABLE } from "../config/billiardsPresets.js";

/* Pocket capture radius: mouth (~0.9) + ball radius — a track passing this
   close to a pocket center drops the cue ball. */
const SCRATCH_R = 1.8;

const ROLL_GAIN = 0.85;
const ENGLISH_MAX_DEG = 12;
const BASE_LEN = 6;
const SAMPLES = 36;

function norm(v) {
  const m = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / m, y: v.y / m };
}

function rotate(v, deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

/* Reflect a coordinate into [min, max] (mirror fold) — models cushion bounces
   for the sampled trajectory. */
function fold(v, min, max) {
  const range = (max - min) * 2;
  let t = (((v - min) % range) + range) % range;
  if (t > max - min) t = range - t;
  return min + t;
}

export function spinLabel(spin) {
  const { sx, sy } = spin;
  let vert = "Stun";
  if (sy > 0.25) vert = "Follow";
  else if (sy < -0.25) vert = "Draw";
  let side = "";
  if (sx < -0.25) side = " · left english";
  else if (sx > 0.25) side = " · right english";
  return vert + side;
}

/**
 * @param sol ShotSolution (cue_ball, object_ball, pocket, ghost_ball, cut_angle_deg)
 * @param spin { sx, sy } each in [-1, 1]; sy > 0 = above center
 * @returns {
 *   path: svg path string | null,
 *   points: [{x,y}] (rail-reflected samples, ghost first),
 *   cumLen: number[] (arc length at each point), totalLen: number,
 *   bounceIdx: number[] (sample indices where a cushion was hit),
 *   end: {x,y}, label, stop: boolean
 * } | null
 */
export function predictCuePath(sol, spin) {
  if (!sol?.ghost_ball || !sol?.cue_ball || !sol?.object_ball || !sol?.pocket) return null;

  const ghost = sol.ghost_ball;
  const aim = norm({ x: ghost.x - sol.cue_ball.x, y: ghost.y - sol.cue_ball.y });
  const objDir = norm({ x: sol.pocket.x - sol.object_ball.x, y: sol.pocket.y - sol.object_ball.y });

  // True stun direction: aim component perpendicular to the object line.
  const along = aim.x * objDir.x + aim.y * objDir.y;
  const perp = { x: aim.x - along * objDir.x, y: aim.y - along * objDir.y };
  const perpMag = Math.hypot(perp.x, perp.y);

  const cutRad = (Math.min(sol.cut_angle_deg ?? 0, 90) * Math.PI) / 180;
  const stunMag = Math.sin(cutRad);
  const rollMag = ROLL_GAIN * spin.sy;

  const stunDir = perpMag > 1e-6 ? norm(perp) : { x: 0, y: 0 };
  let v = {
    x: stunDir.x * stunMag + aim.x * rollMag,
    y: stunDir.y * stunMag + aim.y * rollMag,
  };
  const speed = Math.hypot(v.x, v.y);

  if (speed < 0.08) {
    return {
      path: null,
      points: [{ x: ghost.x, y: ghost.y }],
      cumLen: [0],
      totalLen: 0,
      bounceIdx: [],
      end: ghost,
      label: "Stop shot",
      scratch: false,
      stop: true,
    };
  }

  let dir = norm(v);
  if (Math.abs(spin.sx) > 0.05) {
    dir = rotate(dir, -spin.sx * ENGLISH_MAX_DEG);
  }

  const len = BASE_LEN * Math.min(1, speed) + 3 * Math.abs(spin.sy);
  const rawEnd = { x: ghost.x + dir.x * len, y: ghost.y + dir.y * len };

  // Curved exit: leave along the stun/tangent direction, bend into final dir.
  const initial = perpMag > 1e-6 ? stunDir : dir;
  const ctrl = {
    x: ghost.x + initial.x * len * 0.45,
    y: ghost.y + initial.y * len * 0.45,
  };

  // Sample the quadratic bezier, folding each point into the rails. If the
  // track crosses a pocket mouth, the cue ball scratches — truncate there.
  const r = TABLE.ballR;
  const points = [];
  let scratch = false;
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES;
    const mt = 1 - t;
    const bx = mt * mt * ghost.x + 2 * mt * t * ctrl.x + t * t * rawEnd.x;
    const by = mt * mt * ghost.y + 2 * mt * t * ctrl.y + t * t * rawEnd.y;
    const p = { x: fold(bx, r, TABLE.w - r), y: fold(by, r, TABLE.h - r) };
    points.push(p);
    if (i > 0 && POCKETS.some((k) => Math.hypot(k.x - p.x, k.y - p.y) < SCRATCH_R)) {
      scratch = true;
      break;
    }
  }

  // Arc lengths + cushion hits (direction reversal against the unfolded path).
  const cumLen = [0];
  const bounceIdx = [];
  for (let i = 1; i < points.length; i += 1) {
    const seg = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    cumLen.push(cumLen[i - 1] + seg);
    if (i >= 2) {
      const dx1 = points[i - 1].x - points[i - 2].x;
      const dx2 = points[i].x - points[i - 1].x;
      const dy1 = points[i - 1].y - points[i - 2].y;
      const dy2 = points[i].y - points[i - 1].y;
      if ((dx1 * dx2 < -1e-9 && Math.abs(dx1) > 1e-6) || (dy1 * dy2 < -1e-9 && Math.abs(dy1) > 1e-6)) {
        bounceIdx.push(i - 1);
      }
    }
  }
  const totalLen = cumLen[cumLen.length - 1];
  const end = points[points.length - 1];

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`)
    .join(" ");

  const label = scratch ? `${spinLabel(spin)} · SCRATCH` : spinLabel(spin);
  return { path, points, cumLen, totalLen, bounceIdx, end, label, scratch, stop: false };
}

/** Position at eased arc distance d along the sampled track. */
export function pointAtLength(track, d) {
  const { points, cumLen, totalLen } = track;
  if (points.length === 1 || totalLen <= 0) return points[0];
  const target = Math.max(0, Math.min(d, totalLen));
  let lo = 0;
  let hi = cumLen.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumLen[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const segLen = cumLen[i] - cumLen[i - 1] || 1;
  const f = (target - cumLen[i - 1]) / segLen;
  return {
    x: points[i - 1].x + (points[i].x - points[i - 1].x) * f,
    y: points[i - 1].y + (points[i].y - points[i - 1].y) * f,
  };
}
