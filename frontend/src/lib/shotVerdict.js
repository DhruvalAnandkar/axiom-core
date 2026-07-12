const TABLE_BALL_MIN_DIST = 2.25;

export function shotVerdict(sol) {
  if (!sol) return null;
  const cut = sol.cut_angle_deg ?? 0;
  const cue = sol.cue_ball;
  const obj = sol.object_ball;
  const overlap =
    cue &&
    obj &&
    Math.hypot(cue.x - obj.x, cue.y - obj.y) < TABLE_BALL_MIN_DIST;

  if (sol.is_makeable) {
    return {
      ok: true,
      text: `Makeable — ${cut.toFixed(1)}° cut, aim through the ghost ball`,
    };
  }
  if (sol.unmakeable_reason) {
    return {
      ok: false,
      text: `Not makeable — ${sol.unmakeable_reason} (${cut.toFixed(1)}°)`,
    };
  }
  if (overlap || cut >= 179) {
    return {
      ok: false,
      text: `Not makeable — cue and object balls overlap (${cut.toFixed(1)}° cut)`,
    };
  }
  if (cut > 80) {
    return {
      ok: false,
      text: `Not makeable — cut angle too extreme (${cut.toFixed(1)}°)`,
    };
  }
  return {
    ok: false,
    text: "Not makeable — blocked path on the aim line to the ghost ball",
  };
}

/** Deterministic stroke recommendation: how hard and where to strike. */
export function strokeGuide(sol) {
  if (!sol?.cue_ball || !sol?.ghost_ball || !sol?.object_ball || !sol?.pocket) return null;
  const cueDist = Math.hypot(sol.ghost_ball.x - sol.cue_ball.x, sol.ghost_ball.y - sol.cue_ball.y);
  const objDist = Math.hypot(sol.pocket.x - sol.object_ball.x, sol.pocket.y - sol.object_ball.y);
  const cut = sol.cut_angle_deg ?? 0;
  // Thin cuts transfer little energy — the object ball needs a firmer stroke.
  const effective = cueDist + objDist / Math.max(Math.cos((Math.min(cut, 75) * Math.PI) / 180), 0.35);
  const speed = effective < 16 ? "Soft" : effective < 28 ? "Medium" : "Firm";
  let tip;
  if (cut < 8) tip = "center — a stun hit stops the cue dead";
  else if (cut < 40) tip = "center or a touch of follow to drift off the tangent";
  else tip = "smooth center hit — thin contact keeps cue speed, watch the tangent";
  return { speed, tip };
}

/** Bucket cut_angle_deg from shot_solution — no extra physics. */
export function cutDifficultyTag(sol) {
  const cut = sol?.cut_angle_deg;
  if (cut == null) return null;
  if (cut < 30) return { label: "Easy", tone: "easy" };
  if (cut < 60) return { label: "Medium", tone: "medium" };
  return { label: "Hard", tone: "hard" };
}
