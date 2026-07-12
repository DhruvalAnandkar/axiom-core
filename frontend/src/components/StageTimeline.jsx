import { useMemo } from "react";
import { formatTime } from "../lib/format.js";

const COACH_STAGES = ["researching", "drafting", "critiquing", "done"];

export default function StageTimeline({ packets, withCoach, onSelectPacket }) {
  const seenStages = useMemo(() => {
    const set = new Set();
    for (const p of packets) {
      const s = p.payload?.stage;
      if (s) set.add(s);
    }
    return set;
  }, [packets]);

  const physicsActive = useMemo(
    () => packets.some((p) => p.node_id === "physics" || p.agent_name === "PhysicsCore"),
    [packets],
  );

  const coachPacket = useMemo(() => {
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      if (p.payload?.coach_narrative) return p;
    }
    return null;
  }, [packets]);

  const stagePill = (label, active) =>
    `rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${
      active ? "bg-axiom-green/20 text-axiom-green" : "bg-axiom-border/40 text-axiom-muted"
    }`;

  return (
    <div className="border-b border-axiom-border bg-axiom-surface/60 px-4 py-3">
      <div className="mb-2.5 flex flex-wrap items-center gap-3">
        {!withCoach ? (
          <span className={stagePill("Physics", physicsActive)}>Physics</span>
        ) : (
          COACH_STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className={stagePill(s, seenStages.has(s))}>{s}</span>
              {i < COACH_STAGES.length - 1 && <span className="text-axiom-muted/40">→</span>}
            </div>
          ))
        )}
      </div>
      <div className="axiom-scroll flex gap-2.5 overflow-x-auto">
        {packets.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectPacket(p)}
            className="shrink-0 rounded-lg border border-axiom-border bg-axiom-panel/60 px-3 py-2 text-left transition hover:border-axiom-green/40"
          >
            <p className="text-[10px] font-medium text-axiom-text">
              #{i + 1} {p.agent_name}
            </p>
            <p className="text-[9px] text-axiom-muted">{p.status} · {formatTime(p.receivedAt)}</p>
          </button>
        ))}
        {coachPacket && (
          <button
            type="button"
            onClick={() => onSelectPacket(coachPacket)}
            className="shrink-0 rounded-lg border border-axiom-green/30 bg-axiom-green/10 px-3 py-2 text-[10px] font-medium text-axiom-green"
          >
            View coach analysis
          </button>
        )}
      </div>
    </div>
  );
}
