/** Static copy aligned with engine/graph.py PHYSICS_RULES (Researcher ground truth). */
export const PHYSICS_RULES_COPY = [
  {
    title: "Ghost ball aiming",
    body: "The cue center must reach the ghost point 2 ball radii behind the object, along the line to the pocket.",
  },
  {
    title: "90° tangent rule",
    body: "On a stun shot, the cue ball’s departure path is perpendicular to the object ball’s departure line.",
  },
  {
    title: "Conservation of momentum",
    body: "Momentum splits between cue and object paths according to the cut angle — steeper cuts send more energy sideways.",
  },
  {
    title: "30° rolling deflection",
    body: "Natural roll deflects the cue path by up to ~30°, scaled by cut angle ÷ 90° (rolling english approximation).",
  },
];
