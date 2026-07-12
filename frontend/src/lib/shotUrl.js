import { TABLE } from "../config/billiardsPresets.js";

function parsePair(raw) {
  if (!raw) return null;
  const [xs, ys] = raw.split(",");
  const x = Number(xs);
  const y = Number(ys);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x < 0 || x > TABLE.w || y < 0 || y > TABLE.h) return null;
  return { x, y };
}

export function parseShotFromSearch(search) {
  try {
    const params = new URLSearchParams(search);
    const cue_ball = parsePair(params.get("cue"));
    const object_ball = parsePair(params.get("obj"));
    const pocket = parsePair(params.get("pocket"));
    if (!cue_ball || !object_ball || !pocket) return null;
    return { cue_ball, object_ball, pocket };
  } catch {
    return null;
  }
}

export function shotToSearchParams(shot) {
  if (!shot?.cue_ball || !shot?.object_ball || !shot?.pocket) return null;
  const params = new URLSearchParams();
  params.set("cue", `${shot.cue_ball.x},${shot.cue_ball.y}`);
  params.set("obj", `${shot.object_ball.x},${shot.object_ball.y}`);
  params.set("pocket", `${shot.pocket.x},${shot.pocket.y}`);
  return params;
}

export function shotToUrl(shot, baseUrl = window.location.href) {
  const params = shotToSearchParams(shot);
  if (!params) return null;
  const url = new URL(baseUrl);
  url.search = params.toString();
  return url.toString();
}

export function replaceShotUrl(shot) {
  try {
    const next = shotToUrl(shot);
    if (!next) return;
    window.history.replaceState({}, "", next);
  } catch {
    // URL sync must never break the app.
  }
}

export const HYDRATE_SHOT_EVENT = "axiom-hydrate-shot";

export function dispatchShotHydrate(shot) {
  try {
    window.dispatchEvent(new CustomEvent(HYDRATE_SHOT_EVENT, { detail: shot }));
  } catch {
    // no-op
  }
}
