import { useCallback, useRef } from "react";
import { spinLabel } from "../lib/spinPhysics.js";

const MAX_OFFSET = 0.8;

/** Interactive cue-ball face: click/drag the tip contact point. */
export default function SpinControl({ spin, onChange }) {
  const faceRef = useRef(null);
  const draggingRef = useRef(false);

  const setFromEvent = useCallback(
    (e) => {
      const el = faceRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let sx = ((e.clientX - r.left) / r.width) * 2 - 1;
      let sy = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const m = Math.hypot(sx, sy);
      if (m > MAX_OFFSET) {
        sx = (sx / m) * MAX_OFFSET;
        sy = (sy / m) * MAX_OFFSET;
      }
      onChange({ sx: +sx.toFixed(2), sy: +sy.toFixed(2) });
    },
    [onChange],
  );

  const onPointerDown = useCallback(
    (e) => {
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setFromEvent(e);
    },
    [setFromEvent],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (draggingRef.current) setFromEvent(e);
    },
    [setFromEvent],
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const dotX = 50 + spin.sx * 50;
  const dotY = 50 - spin.sy * 50;
  const isCenter = Math.hypot(spin.sx, spin.sy) < 0.05;

  return (
    <div className="axiom-glass axiom-glow animate-fade-in rounded-xl border border-axiom-border p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-axiom-text">
        Cue Ball Control
      </p>
      <div
        ref={faceRef}
        role="slider"
        aria-label="Cue tip contact point"
        aria-valuetext={spinLabel(spin)}
        className="relative mx-auto h-24 w-24 cursor-crosshair touch-none select-none rounded-full border border-axiom-border"
        style={{
          background:
            "radial-gradient(circle at 34% 30%, #ffffff, #d9dee6 55%, #aab3c0 100%)",
          boxShadow: "inset 0 -6px 14px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.4)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-500/25" />
        <span className="pointer-events-none absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-slate-500/25" />
        <span
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gradient-to-br from-axiom-green to-axiom-green-dim shadow-lg transition-all duration-100"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-axiom-green">{spinLabel(spin)}</p>
        {!isCenter && (
          <button
            type="button"
            onClick={() => onChange({ sx: 0, sy: 0 })}
            className="rounded-md border border-axiom-border px-2 py-0.5 text-[10px] text-axiom-muted transition hover:border-axiom-green/40 hover:text-axiom-text"
          >
            Center
          </button>
        )}
      </div>
      <p className="mt-1 max-w-[9.5rem] text-[10px] leading-snug text-axiom-muted">
        Violet path = predicted cue-ball travel after contact.
      </p>
    </div>
  );
}
