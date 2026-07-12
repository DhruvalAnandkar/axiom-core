/** Table coords in physics units (36×18). Presets hit physics core only (with_coach: false). */
export const TABLE = { w: 36, h: 18, ballR: 1.125 };

export const POCKETS = [
  { x: 0, y: 0 },
  { x: TABLE.w / 2, y: 0 },
  { x: TABLE.w, y: 0 },
  { x: 0, y: TABLE.h },
  { x: TABLE.w / 2, y: TABLE.h },
  { x: TABLE.w, y: TABLE.h },
];

/** Fixed scene-dressing balls — not part of the active shot. */
export const AMBIENT_BALLS = [
  { x: 7.5, y: 5.5, color: "#475569" },
  { x: 24, y: 4, color: "#334155" },
  { x: 28, y: 14, color: "#64748b" },
  { x: 10, y: 15, color: "#3f4f63" },
];

export const PRESETS = [
  {
    id: "straight",
    label: "Straight-In",
    cue_ball: { x: 4, y: 9 },
    object_ball: { x: 18, y: 9 },
    pocket: { x: 34, y: 9 },
  },
  {
    id: "cut45",
    label: "45° Cut",
    cue_ball: { x: 4, y: 1.5 },
    object_ball: { x: 10, y: 5 },
    pocket: { x: 20, y: 5 },
  },
  {
    id: "thin",
    label: "Thin Cut",
    cue_ball: { x: 2, y: 2 },
    object_ball: { x: 14, y: 9 },
    pocket: { x: 34, y: 1 },
  },
  {
    id: "bank",
    label: "Bank-Angle-Demo",
    cue_ball: { x: 3, y: 3 },
    object_ball: { x: 15, y: 12 },
    pocket: { x: 34, y: 3 },
  },
];
