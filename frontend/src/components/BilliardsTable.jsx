import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { AMBIENT_BALLS, POCKETS, PRESETS, TABLE } from "../config/billiardsPresets.js";
import { toast } from "sonner";
import { cutDifficultyTag, shotVerdict, strokeGuide } from "../lib/shotVerdict.js";
import { partitionVectorData, vectorById, warnOutOfBounds } from "../lib/vectorRender.js";
import { HYDRATE_SHOT_EVENT } from "../lib/shotUrl.js";
import { pointAtLength, predictCuePath } from "../lib/spinPhysics.js";
import { usePreferences } from "../context/PreferencesProvider.jsx";
import MagneticButton from "./MagneticButton.jsx";
import SpinControl from "./SpinControl.jsx";

const POCKET_R = 0.9;
const SNAP_R = 2.5;
const POCKET_HIT = 1.0;
const STICK_LEN = 4.2;
const STICK_W = 0.22;
const AMBIENT_R = TABLE.ballR * 0.72;

const INITIAL_AIM = { step: 0, cue_ball: null, object_ball: null, pocket: null };

const STEP_GUIDES = [
  "Step 1 of 3: Click to place the cue ball",
  "Step 2 of 3: Click to place the object ball",
  "Step 3 of 3: Click a pocket to aim at",
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

function isAtPocket(pt, aimPocket = null) {
  if (aimPocket && dist(aimPocket, pt) < POCKET_HIT) return true;
  return POCKETS.some((p) => dist(p, pt) < POCKET_HIT);
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const easeOutQuad = (p) => 1 - (1 - p) * (1 - p);
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
const DEG_PER_UNIT = 180 / (Math.PI * TABLE.ballR); // rolling: arc → degrees

/* Ball with rolling marks — rotation makes travel and spin readable. */
function RollingBall({ x, y, rot, fill, markFill, opacity = 1, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} filter="url(#ballShadow)">
      <circle r={TABLE.ballR} fill={fill} stroke="#1e293b" strokeWidth={0.15} />
      <g transform={`rotate(${rot})`} opacity={0.55}>
        <circle cx={TABLE.ballR * 0.52} cy={0} r={0.15} fill={markFill} />
        <circle cx={-TABLE.ballR * 0.52} cy={0} r={0.15} fill={markFill} />
        <circle cx={0} cy={TABLE.ballR * 0.52} r={0.15} fill={markFill} />
        <circle cx={0} cy={-TABLE.ballR * 0.52} r={0.15} fill={markFill} />
      </g>
      <ellipse
        cx={-TABLE.ballR * 0.28}
        cy={-TABLE.ballR * 0.32}
        rx={TABLE.ballR * 0.38}
        ry={TABLE.ballR * 0.22}
        fill="#ffffff"
        opacity={0.34}
      />
    </g>
  );
}

function toSvg(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const local = pt.matrixTransform(ctm.inverse());
  return {
    x: Math.max(0.5, Math.min(TABLE.w - 0.5, local.x)),
    y: Math.max(0.5, Math.min(TABLE.h - 0.5, local.y)),
  };
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
    case "PRESET":
      return {
        step: 3,
        cue_ball: clonePt(action.cue_ball),
        object_ball: clonePt(action.object_ball),
        pocket: clonePt(action.pocket),
      };
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

function StaticBall({ cx, cy, r, fill, stroke, strokeDash, label, glossy = true }) {
  return (
    <g filter={glossy ? "url(#ballShadow)" : undefined}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke ?? "#1e293b"}
        strokeWidth={0.15}
        strokeDasharray={strokeDash}
      />
      {glossy && !strokeDash && (
        <ellipse
          cx={cx - r * 0.28}
          cy={cy - r * 0.32}
          rx={r * 0.38}
          ry={r * 0.22}
          fill="#ffffff"
          opacity={0.38}
        />
      )}
      {label && (
        <text x={cx} y={cy + 0.35} textAnchor="middle" fontSize="0.9" fill="#0a1410" fontWeight="700">
          {label}
        </text>
      )}
    </g>
  );
}

function VectorLine({ line }) {
  return (
    <motion.line
      className="axiom-flow-line"
      x1={line.start.x}
      y1={line.start.y}
      x2={line.end.x}
      y2={line.end.y}
      stroke={line.color}
      strokeWidth={0.12}
      strokeDasharray="0.4 0.3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      transition={{ duration: 0.25 }}
    />
  );
}

function aimStickGeometry(aimVec, cueVec) {
  if (!aimVec || !cueVec) return null;
  const cue = cueVec.start;
  const ghost = aimVec.end;
  const dx = ghost.x - cue.x;
  const dy = ghost.y - cue.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const centerOffset = TABLE.ballR + STICK_LEN * 0.5;
  const restGap = 0.35;
  const strikeGap = 0.08;
  return {
    angle,
    stickLen: STICK_LEN,
    stickW: STICK_W,
    restX: cue.x - ux * (centerOffset + restGap),
    restY: cue.y - uy * (centerOffset + restGap),
    strikeX: cue.x - ux * (centerOffset - TABLE.ballR + strikeGap),
    strikeY: cue.y - uy * (centerOffset - TABLE.ballR + strikeGap),
  };
}

function CueStick({ geom, striking, onStrikeComplete }) {
  if (!geom) return null;
  return (
    <motion.g
      initial={false}
      animate={{ x: striking ? geom.strikeX : geom.restX, y: striking ? geom.strikeY : geom.restY }}
      transition={{ duration: striking ? 0.2 : 0, ease: "easeIn" }}
      onAnimationComplete={() => {
        if (striking) onStrikeComplete();
      }}
    >
      <g transform={`rotate(${geom.angle})`}>
        <rect
          x={-geom.stickLen * 0.5}
          y={-geom.stickW / 2}
          width={geom.stickLen}
          height={geom.stickW}
          rx={0.06}
          fill="#d4a574"
          stroke="#8b6914"
          strokeWidth={0.04}
        />
        <rect
          x={geom.stickLen * 0.36}
          y={-geom.stickW * 0.32}
          width={geom.stickLen * 0.1}
          height={geom.stickW * 0.64}
          rx={0.02}
          fill="#1a1410"
        />
      </g>
    </motion.g>
  );
}

export default function BilliardsTable({
  vectorData = [],
  shotSolution,
  onComputeShot,
  onNewShot,
  withCoach,
  onWithCoachChange,
}) {
  const { prefs } = usePreferences();
  const svgRef = useRef(null);
  const tiltRef = useRef(null);
  const clackRef = useRef(null);
  const plopRef = useRef(null);
  const [aim, dispatchAim] = useReducer(aimReducer, INITIAL_AIM);
  const [potPhase, setPotPhase] = useState(null); // null | strike | run | done
  const [muted, setMuted] = useState(() => !prefs.soundEffects);
  const [spin, setSpin] = useState({ sx: 0, sy: 0 });
  const [anim, setAnim] = useState(null);
  const spinRef = useRef(spin);
  const finalCueRef = useRef(null);
  const [glowFired, setGlowFired] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [obstacles, setObstacles] = useState([]);

  useEffect(() => {
    spinRef.current = spin;
  }, [spin]);

  const { lines, balls } = useMemo(() => partitionVectorData(vectorData), [vectorData]);
  const cueVec = useMemo(() => vectorById(vectorData, "cue"), [vectorData]);
  const aimVec = useMemo(() => vectorById(vectorData, "aim"), [vectorData]);
  const ghostVec = useMemo(() => vectorById(vectorData, "ghost"), [vectorData]);
  const objectVec = useMemo(() => vectorById(vectorData, "object"), [vectorData]);
  const stickGeom = useMemo(() => aimStickGeometry(aimVec, cueVec), [aimVec, cueVec]);

  const hasResult = vectorData.length > 0 || !!shotSolution;
  const showGuide = !hasResult && aim.step < 3;
  const pocketMarker = aim.pocket ? nearestPocket(aim.pocket) : null;
  const verdict = useMemo(() => shotVerdict(shotSolution), [shotSolution]);
  const difficulty = useMemo(() => cutDifficultyTag(shotSolution), [shotSolution]);
  const potting = potPhase !== null;
  const showCueStick = hasResult && stickGeom && (potPhase === null || potPhase === "strike");
  const showSpin = hasResult && !!shotSolution && potPhase === null;
  const stroke = useMemo(() => strokeGuide(shotSolution), [shotSolution]);
  const spinPrediction = useMemo(
    () => (showSpin && shotSolution ? predictCuePath(shotSolution, spin) : null),
    [showSpin, shotSolution, spin],
  );

  const playClack = useCallback((volume = 1) => {
    if (muted || !clackRef.current) return;
    clackRef.current.volume = volume;
    clackRef.current.currentTime = 0;
    clackRef.current.play().catch(() => {});
  }, [muted]);

  const playPlop = useCallback(() => {
    if (muted || !plopRef.current) return;
    plopRef.current.currentTime = 0;
    plopRef.current.play().catch(() => {});
  }, [muted]);

  useEffect(() => {
    if (vectorData.length) warnOutOfBounds(vectorData);
  }, [vectorData]);

  useEffect(() => {
    setPotPhase(null);
    setAnim(null);
    setGlowFired(false);
    setScratched(false);
    finalCueRef.current = null;
  }, [vectorData]);

  const objectEnd = objectVec?.end;
  const objectSinks =
    Boolean(shotSolution?.is_makeable) && objectEnd && isAtPocket(objectEnd, shotSolution?.pocket);
  // Where the object ball actually comes to rest: the pocket if makeable,
  // 55% down the computed line if the shot misses.
  const objectRest = useMemo(() => {
    if (!objectVec) return null;
    if (shotSolution?.is_makeable) return objectVec.end;
    return {
      x: objectVec.start.x + (objectVec.end.x - objectVec.start.x) * 0.55,
      y: objectVec.start.y + (objectVec.end.y - objectVec.start.y) * 0.55,
    };
  }, [objectVec, shotSolution]);

  /* Shot simulation: one rAF timeline. The cue rolls in (skidding backward on
     draw), the collision splits the motion — object ball decelerates toward
     the pocket while the cue simultaneously follows its spin-predicted track,
     reflecting off cushions. Stop shots kill velocity; english spins in place. */
  useEffect(() => {
    if (potPhase !== "run") return undefined;
    if (!cueVec || !ghostVec || !objectVec || !shotSolution) return undefined;

    const spinNow = spinRef.current;
    const track = predictCuePath(shotSolution, spinNow) ?? {
      stop: true, points: [ghostVec.start], cumLen: [0], totalLen: 0, bounceIdx: [],
    };

    const cueStart = cueVec.start;
    const ghost = ghostVec.start;
    const objStart = objectVec.start;
    const makeable = Boolean(shotSolution.is_makeable);
    // A missed shot still moves the object ball along the computed line — it
    // just runs out of pace short of the pocket instead of dropping.
    const objEndPt = makeable
      ? objectVec.end
      : {
          x: objStart.x + (objectVec.end.x - objStart.x) * 0.55,
          y: objStart.y + (objectVec.end.y - objStart.y) * 0.55,
        };
    const sinks = makeable && isAtPocket(objectVec.end, shotSolution.pocket);

    const approachDist = dist(cueStart, ghost);
    const objDist = dist(objStart, objEndPt);
    const approachDur = clamp(approachDist * 80, 320, 850);
    const objDur = clamp(objDist * 105, 420, 1150);
    const sinkDur = 260;
    // Straight-in draw: the cue grabs for a beat, spinning in place, then draws back.
    const drawHold =
      !track.stop && (shotSolution.cut_angle_deg ?? 0) < 10 && spinNow.sy < -0.25 ? 170 : 0;
    const cueTravelDur = track.stop ? 0 : clamp(track.totalLen * 115, 420, 1250);
    const stopSpinDur = track.stop && Math.abs(spinNow.sx) > 0.2 ? 700 : 240;
    const cueSinkDur = track.scratch ? 240 : 0;
    const cueTotal = track.stop ? stopSpinDur : drawHold + cueTravelDur + cueSinkDur;
    const objTotal = objDur + (sinks ? sinkDur : 0);
    const total = approachDur + Math.max(objTotal, cueTotal) + 120;

    // Rolling behaviour on the way in: skid backward on draw, over-roll on follow.
    const approachRollRate =
      spinNow.sy < -0.25 ? -(0.6 + Math.abs(spinNow.sy)) : spinNow.sy > 0.25 ? 1 + 0.5 * spinNow.sy : 0.65;

    let raf;
    let clacked = false;
    let plopped = false;
    let cuePlopped = false;
    let glowSet = false;
    let lastT = performance.now();
    let cueRot = 0;
    let objRot = 0;
    let bouncesPlayed = 0;
    const t0 = performance.now();

    const tick = (now) => {
      const t = now - t0;
      const dt = Math.min(now - lastT, 50);
      lastT = now;

      let cue = { x: cueStart.x, y: cueStart.y, scale: 1, opacity: 1 };
      let obj = { x: objStart.x, y: objStart.y, scale: 1, opacity: 1 };
      let glow = glowSet;

      if (t < approachDur) {
        const p = t / approachDur;
        cue = {
          x: cueStart.x + (ghost.x - cueStart.x) * p,
          y: cueStart.y + (ghost.y - cueStart.y) * p,
        };
        cueRot = approachDist * p * DEG_PER_UNIT * approachRollRate;
      } else {
        const tc = t - approachDur;
        if (!clacked) {
          clacked = true;
          playClack(1);
        }

        // Object ball: decelerating roll, then sinks.
        const po = easeOutQuad(clamp(tc / objDur, 0, 1));
        obj.x = objStart.x + (objEndPt.x - objStart.x) * po;
        obj.y = objStart.y + (objEndPt.y - objStart.y) * po;
        objRot = objDist * po * DEG_PER_UNIT;
        if (sinks && tc >= objDur) {
          const ps = clamp((tc - objDur) / sinkDur, 0, 1);
          obj.scale = 1 - ps;
          obj.opacity = 1 - ps;
          if (!plopped) {
            plopped = true;
            playPlop();
          }
          if (!glowSet) {
            glowSet = true;
            glow = true;
            setGlowFired(true);
          }
        }

        // Cue ball after contact.
        if (track.stop) {
          cue = { x: ghost.x, y: ghost.y };
          const ps = clamp(tc / stopSpinDur, 0, 1);
          // English keeps it spinning at the spot, decaying to rest.
          cueRot += -spinNow.sx * 900 * (1 - ps) * (dt / 1000) * (Math.abs(spinNow.sx) > 0.2 ? 1 : 0.3);
        } else if (tc < drawHold) {
          cue = { x: ghost.x, y: ghost.y };
          cueRot -= (0.8 + Math.abs(spinNow.sy)) * 1100 * (dt / 1000);
        } else {
          const pc = easeOutCubic(clamp((tc - drawHold) / cueTravelDur, 0, 1));
          const d = pc * track.totalLen;
          const pos = pointAtLength(track, d);
          cue = { ...cue, x: pos.x, y: pos.y };
          // Rolling forward along the travelled arc.
          cueRot = approachDist * DEG_PER_UNIT * approachRollRate + d * DEG_PER_UNIT;
          // Cushion clicks as the track crosses bounce samples.
          while (
            bouncesPlayed < track.bounceIdx.length &&
            track.cumLen[track.bounceIdx[bouncesPlayed]] <= d
          ) {
            bouncesPlayed += 1;
            playClack(0.35);
          }
          // Scratch: the track ends inside a pocket mouth — the cue drops.
          if (track.scratch && tc >= drawHold + cueTravelDur) {
            const ps = clamp((tc - drawHold - cueTravelDur) / cueSinkDur, 0, 1);
            cue.scale = 1 - ps;
            cue.opacity = 1 - ps;
            if (!cuePlopped) {
              cuePlopped = true;
              playPlop();
            }
          }
        }
      }

      setAnim({ cue: { ...cue, rot: cueRot }, obj: { ...obj, rot: objRot }, glow });

      if (t < total) {
        raf = requestAnimationFrame(tick);
      } else {
        finalCueRef.current = track.stop
          ? { x: ghost.x, y: ghost.y }
          : track.points[track.points.length - 1];
        if (track.scratch) {
          setScratched(true);
          toast.error("Scratch — the cue ball dropped in the pocket.");
        } else if (!makeable) {
          toast("Missed — the object ball ran out of angle.", { duration: 3000 });
        }
        try {
          window.dispatchEvent(
            new CustomEvent("axiom-shot-taken", {
              detail: { made: sinks, scratched: track.scratch },
            }),
          );
        } catch {
          // no-op
        }
        setPotPhase("done");
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [potPhase]);

  useEffect(() => {
    if (!aim.pendingShot) return;
    onComputeShot({ ...aim.pendingShot, obstacles, with_coach: withCoach });
    dispatchAim({ type: "CLEAR_PENDING" });
  }, [aim.pendingShot, onComputeShot, withCoach, obstacles]);

  useEffect(() => {
    const onHydrate = (e) => {
      const shot = e.detail;
      if (!shot?.cue_ball || !shot?.object_ball || !shot?.pocket) return;
      dispatchAim({
        type: "PRESET",
        cue_ball: shot.cue_ball,
        object_ball: shot.object_ball,
        pocket: shot.pocket,
      });
    };
    window.addEventListener(HYDRATE_SHOT_EVENT, onHydrate);
    return () => window.removeEventListener(HYDRATE_SHOT_EVENT, onHydrate);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (hasResult || potting || aim.step === 0) return;
      dispatchAim({ type: "RESET" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasResult, potting, aim.step]);

  const handleUndo = useCallback(() => {
    dispatchAim({ type: "UNDO" });
  }, []);

  const handleClick = useCallback((e) => {
    if (potting) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = toSvg(svg, e.clientX, e.clientY);
    if (!pt) return;
    dispatchAim({ type: "CLICK", point: pt });
  }, [potting]);

  // Right-click drops a blocker ball — a real obstacle the physics core
  // routes around (or declares the shot blocked).
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (potting) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = toSvg(svg, e.clientX, e.clientY);
    if (!pt) return;
    if (obstacles.length >= 5) return;
    const next = [...obstacles, pt];
    setObstacles(next);
    // A placed shot re-solves immediately against the new blocker.
    if (aim.cue_ball && aim.object_ball && aim.pocket) {
      onComputeShot({
        cue_ball: clonePt(aim.cue_ball),
        object_ball: clonePt(aim.object_ball),
        pocket: clonePt(aim.pocket),
        obstacles: next,
        with_coach: false,
      });
    }
  }, [potting, obstacles, aim.cue_ball, aim.object_ball, aim.pocket, onComputeShot]);

  const loadPreset = useCallback(
    (preset) => {
      const pocket = nearestPocket(preset.pocket);
      dispatchAim({
        type: "PRESET",
        cue_ball: preset.cue_ball,
        object_ball: preset.object_ball,
        pocket,
      });
      onComputeShot({
        cue_ball: clonePt(preset.cue_ball),
        object_ball: clonePt(preset.object_ball),
        pocket,
        obstacles,
        with_coach: false,
      });
    },
    [onComputeShot, obstacles],
  );

  const handleNewShot = useCallback(() => {
    if (prefs.confirmNewShot && !window.confirm("Start a new shot? Current aim will be cleared.")) {
      return;
    }
    setPotPhase(null);
    setObstacles([]);
    dispatchAim({ type: "RESET" });
    onNewShot();
  }, [onNewShot, prefs.confirmNewShot]);

  const handleTakeShot = useCallback(() => {
    if (!cueVec || !ghostVec || !objectVec) return;
    setPotPhase("strike");
  }, [cueVec, ghostVec, objectVec]);

  // Tilt is presentation-only and active only once a result is shown, so the
  // aiming click → table coordinate mapping never runs against a 3D transform.
  const onTiltMove = useCallback(
    (e) => {
      const el = tiltRef.current;
      if (!el || !hasResult) return;
      const r = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform 0.15s ease-out";
      el.style.transform = `perspective(1200px) rotateX(${(-ny * 8).toFixed(2)}deg) rotateY(${(nx * 8).toFixed(2)}deg)`;
    },
    [hasResult],
  );

  const onTiltLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "perspective(1200px)";
  }, []);

  useEffect(() => {
    if (!hasResult) onTiltLeave();
  }, [hasResult, onTiltLeave]);

  const handleStrikeComplete = useCallback(() => {
    setPotPhase("run");
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <audio ref={clackRef} src="/sounds/clack.wav" preload="auto" />
      <audio ref={plopRef} src="/sounds/plop.wav" preload="auto" />
      <div className="flex flex-wrap items-center gap-3 border-b border-axiom-border bg-axiom-panel/40 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-axiom-muted">Presets</span>
        {PRESETS.map((p) => (
          <MagneticButton
            key={p.id}
            onClick={() => loadPreset(p)}
            className="rounded-lg border border-axiom-border bg-axiom-surface px-2.5 py-1 text-[11px] text-axiom-text transition hover:border-axiom-green/50 hover:text-axiom-green"
          >
            {p.label}
          </MagneticButton>
        ))}
        <MagneticButton
          onClick={handleNewShot}
          className="rounded-lg border border-axiom-green/40 bg-axiom-green/10 px-3 py-1 text-[11px] font-medium text-axiom-green transition hover:bg-axiom-green/20"
        >
          New Shot
        </MagneticButton>
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] text-axiom-muted">
          <input
            type="checkbox"
            checked={withCoach}
            onChange={(e) => onWithCoachChange(e.target.checked)}
            className="accent-axiom-green"
          />
          AI Coach
        </label>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="flex items-center gap-1 rounded-lg border border-axiom-border bg-axiom-surface px-2 py-1 text-[11px] text-axiom-muted transition hover:border-axiom-green/40 hover:text-axiom-text"
          aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span>{muted ? "Muted" : "Sound"}</span>
        </button>
      </div>

      {showGuide && (
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-axiom-border bg-axiom-surface/80 px-4 py-3 text-center text-sm font-medium text-axiom-text">
          <span>{STEP_GUIDES[aim.step]}</span>
          {aim.step > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="min-h-[44px] rounded-lg border border-axiom-border bg-axiom-panel px-3 py-1 text-xs text-axiom-muted hover:border-axiom-green/40 hover:text-axiom-text"
            >
              Undo last point
            </button>
          )}
        </div>
      )}

      {!hasResult && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-b border-axiom-border/60 bg-axiom-panel/20 px-4 py-2 text-[11px] text-axiom-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-white shadow" /> white = cue ball
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500 shadow" /> orange = object ball
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border border-dashed border-axiom-success/70 bg-axiom-success/30" /> translucent green = ghost ball
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-rose-400/80 shadow" /> right-click = add blocker ball
          </span>
        </div>
      )}

      {verdict && hasResult && (
        <div
          className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-sm font-semibold ${
            verdict.ok
              ? "border-b border-axiom-success/30 bg-axiom-success/15 text-axiom-success"
              : "border-b border-amber-500/30 bg-amber-500/15 text-amber-200"
          }`}
        >
          <span>{verdict.text}</span>
          {verdict.ok && difficulty && (
            <span className="text-[11px] font-medium tracking-wide text-axiom-muted">
              Difficulty:{" "}
              <span
                className={
                  difficulty.tone === "easy"
                    ? "text-axiom-success"
                    : difficulty.tone === "medium"
                      ? "text-amber-300"
                      : "text-rose-300"
                }
              >
                {difficulty.label}
              </span>
            </span>
          )}
          {stroke && (
            <span className="text-[11px] font-medium tracking-wide text-axiom-muted">
              Stroke: <span className="text-axiom-text">{stroke.speed}</span>
              <span className="hidden sm:inline"> · tip {stroke.tip}</span>
            </span>
          )}
          {!potting && (
            <MagneticButton
              onClick={handleTakeShot}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold shadow transition hover:brightness-110 ${
                verdict.ok ? "bg-axiom-green text-axiom-bg" : "bg-amber-400 text-axiom-bg"
              }`}
            >
              {verdict.ok ? "Take Shot" : "Try It Anyway"}
            </MagneticButton>
          )}
        </div>
      )}

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center p-5 md:p-6"
        onMouseMove={onTiltMove}
        onMouseLeave={onTiltLeave}
      >
        <div ref={tiltRef} className="flex max-h-full w-full max-w-4xl items-center justify-center" style={{ willChange: "transform" }}>
        <svg
          ref={svgRef}
          viewBox={`-1 -1 ${TABLE.w + 2} ${TABLE.h + 2}`}
          className="axiom-cue-cursor max-h-full w-full rounded-xl"
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          role="img"
          aria-label="Billiards table"
        >
          <defs>
            <radialGradient id="feltRadial" cx="50%" cy="50%" r="72%">
              <stop offset="0%" stopColor="#0a8f52" />
              <stop offset="55%" stopColor="#066b3d" />
              <stop offset="100%" stopColor="#032818" />
            </radialGradient>
            <filter id="ballShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0.18" stdDeviation="0.22" floodColor="#000000" floodOpacity="0.55" />
            </filter>
            <radialGradient id="potGlow">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={-0.8} y={-0.8} width={TABLE.w + 1.6} height={TABLE.h + 1.6} rx={0.6} fill="#1e293b" />
          <rect x={0} y={0} width={TABLE.w} height={TABLE.h} rx={0.3} fill="url(#feltRadial)" stroke="#334155" strokeWidth={0.2} />

          {POCKETS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={POCKET_R} fill="#0a0a0a" stroke="#1e293b" strokeWidth={0.15} />
          ))}

          {AMBIENT_BALLS.map((b, i) => (
            <circle
              key={`ambient-${i}`}
              cx={b.x}
              cy={b.y}
              r={AMBIENT_R}
              fill={b.color}
              opacity={0.42}
              stroke="#1e293b"
              strokeWidth={0.1}
            />
          ))}

          {obstacles.map((b, i) => (
            <g key={`obstacle-${i}`} filter="url(#ballShadow)">
              <circle cx={b.x} cy={b.y} r={TABLE.ballR} fill="#f43f5e" stroke="#1e293b" strokeWidth={0.15} />
              <ellipse
                cx={b.x - TABLE.ballR * 0.28}
                cy={b.y - TABLE.ballR * 0.32}
                rx={TABLE.ballR * 0.38}
                ry={TABLE.ballR * 0.22}
                fill="#ffffff"
                opacity={0.3}
              />
            </g>
          ))}

          {!hasResult && aim.cue_ball && (
            <circle cx={aim.cue_ball.x} cy={aim.cue_ball.y} r={TABLE.ballR} fill="#ffffff" opacity={0.7} />
          )}
          {!hasResult && aim.object_ball && (
            <circle cx={aim.object_ball.x} cy={aim.object_ball.y} r={TABLE.ballR} fill="#f59e0b" opacity={0.7} />
          )}
          {!hasResult && pocketMarker && (
            <circle
              cx={pocketMarker.x}
              cy={pocketMarker.y}
              r={POCKET_R + 0.15}
              fill="none"
              stroke="#00ff66"
              strokeWidth={0.12}
              strokeDasharray="0.25 0.2"
              opacity={0.9}
            />
          )}

          <AnimatePresence>
            {lines.map((line) => (
              <VectorLine key={line.ball_id} line={line} />
            ))}
          </AnimatePresence>

          {spinPrediction && !spinPrediction.stop && (
            <g pointerEvents="none">
              <motion.path
                className="axiom-flow-line"
                d={spinPrediction.path}
                fill="none"
                stroke={spinPrediction.scratch ? "#f43f5e" : "#8b5cf6"}
                strokeWidth={0.16}
                strokeDasharray="0.4 0.3"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.95 }}
                transition={{ duration: 0.25 }}
              />
              <circle
                cx={spinPrediction.end.x}
                cy={spinPrediction.end.y}
                r={0.32}
                fill={spinPrediction.scratch ? "#f43f5e" : "#8b5cf6"}
                opacity={0.9}
              />
              <text
                x={spinPrediction.end.x}
                y={spinPrediction.end.y - 0.7}
                textAnchor="middle"
                fontSize="0.85"
                fill={spinPrediction.scratch ? "#fda4af" : "#c4b5fd"}
                fontWeight="600"
                style={{ paintOrder: "stroke", stroke: "#0a0d12", strokeWidth: 0.22 }}
              >
                {spinPrediction.label}
              </text>
            </g>
          )}
          {spinPrediction?.stop && (
            <g pointerEvents="none">
              <circle cx={spinPrediction.end.x} cy={spinPrediction.end.y} r={0.5} fill="none" stroke="#8b5cf6" strokeWidth={0.14} strokeDasharray="0.25 0.2" />
              <text
                x={spinPrediction.end.x}
                y={spinPrediction.end.y - 1.9}
                textAnchor="middle"
                fontSize="0.85"
                fill="#c4b5fd"
                fontWeight="600"
                style={{ paintOrder: "stroke", stroke: "#0a0d12", strokeWidth: 0.22 }}
              >
                Stop shot
              </text>
            </g>
          )}

          {showCueStick && (
            <CueStick
              geom={stickGeom}
              striking={potPhase === "strike"}
              onStrikeComplete={handleStrikeComplete}
            />
          )}

          {hasResult && potPhase === null && ghostVec && (
            <circle
              className="axiom-ghost-pulse"
              cx={ghostVec.start.x}
              cy={ghostVec.start.y}
              r={TABLE.ballR * 1.55}
              fill={verdict?.ok ? "#00ff66" : "#f43f5e"}
            />
          )}

          {balls.map((b) => {
            if (b.ball_id === "ghost" && potPhase !== null) {
              return null;
            }
            if ((b.ball_id === "cue" || b.ball_id === "object") && potPhase === "run") {
              return null;
            }
            if (b.ball_id === "cue" && potPhase === "done" && scratched) {
              return null;
            }
            if (b.ball_id === "object" && potPhase === "done" && objectSinks) {
              return null;
            }
            const pos =
              b.ball_id === "cue" && potPhase === "done" && finalCueRef.current
                ? finalCueRef.current
                : b.ball_id === "object" && potPhase === "done" && objectRest
                  ? objectRest
                  : b.start;
            return (
              <StaticBall
                key={b.ball_id}
                cx={pos.x}
                cy={pos.y}
                r={TABLE.ballR}
                fill={b.color}
                stroke={b.ball_id === "ghost" ? "#00ff66" : undefined}
                strokeDash={b.ball_id === "ghost" ? "0.3 0.2" : undefined}
                glossy={b.ball_id !== "ghost"}
                label={b.ball_id === "cue" ? "C" : b.ball_id === "object" ? "O" : "G"}
              />
            );
          })}

          {potPhase === "run" && anim && (
            <>
              {anim.obj.opacity > 0 && (
                <RollingBall
                  x={anim.obj.x}
                  y={anim.obj.y}
                  rot={anim.obj.rot}
                  fill="#f59e0b"
                  markFill="#7c2d12"
                  opacity={anim.obj.opacity}
                  scale={Math.max(anim.obj.scale, 0.01)}
                />
              )}
              {anim.cue.opacity > 0 && (
                <RollingBall
                  x={anim.cue.x}
                  y={anim.cue.y}
                  rot={anim.cue.rot}
                  fill="#ffffff"
                  markFill="#64748b"
                  opacity={anim.cue.opacity}
                  scale={Math.max(anim.cue.scale, 0.01)}
                />
              )}
            </>
          )}

          {glowFired && objectSinks && shotSolution?.pocket && (
            <motion.circle
              cx={shotSolution.pocket.x}
              cy={shotSolution.pocket.y}
              fill="url(#potGlow)"
              pointerEvents="none"
              initial={{ r: 0.6, opacity: 1 }}
              animate={{ r: 4.2, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
        </svg>
        </div>

        {showSpin && (
          <div className="absolute bottom-4 left-4 z-10">
            <SpinControl spin={spin} onChange={setSpin} />
          </div>
        )}
      </div>
    </div>
  );
}
