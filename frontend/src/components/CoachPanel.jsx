import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { BrainCircuit, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { useAgent } from "../context/AgentProvider.jsx";
import { cutDifficultyTag, shotVerdict } from "../lib/shotVerdict.js";
import { useSessionShotStats } from "../features/workspace-shots/useSessionShotStats.js";

const TONE_CLASS = {
  easy: "text-axiom-success",
  medium: "text-amber-300",
  hard: "text-rose-300",
};

const STAGE_STEPS = [
  { key: "researching", label: "Research", Icon: BrainCircuit },
  { key: "drafting", label: "Draft", Icon: PenLine },
  { key: "critiquing", label: "Critique", Icon: ShieldCheck },
];

function SummaryCard({ solution }) {
  const verdict = shotVerdict(solution);
  const difficulty = cutDifficultyTag(solution);
  if (!verdict) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-lg border border-axiom-border bg-axiom-bg/60 p-3"
    >
      <p className={`text-[11px] font-semibold ${verdict.ok ? "text-axiom-success" : "text-amber-200"}`}>
        {verdict.text}
      </p>
      {difficulty && (
        <p className="mt-1.5 text-[11px] text-axiom-muted">
          Difficulty: <span className={TONE_CLASS[difficulty.tone]}>{difficulty.label}</span>
          <span className="text-axiom-muted/70"> · {solution.cut_angle_deg.toFixed(1)}° cut</span>
        </p>
      )}
    </motion.div>
  );
}

/* Live pipeline strip: which agent is working right now. */
function StagePulse({ stage }) {
  const activeIdx = STAGE_STEPS.findIndex((s) => s.key === stage);
  return (
    <div className="flex items-center gap-1" aria-label={`Coach stage: ${stage}`}>
      {STAGE_STEPS.map(({ key, label, Icon }, i) => {
        const active = i === activeIdx;
        const done = activeIdx === -1 || i < activeIdx;
        return (
          <span
            key={key}
            title={label}
            className={`flex items-center rounded-full border p-1 transition-colors duration-300 ${
              active
                ? "border-axiom-green/50 bg-axiom-green/10 text-axiom-green"
                : done
                  ? "border-axiom-border text-axiom-muted"
                  : "border-axiom-border/50 text-axiom-muted/50"
            }`}
          >
            <Icon className={`h-3 w-3 ${active ? "animate-pulse" : ""}`} />
          </span>
        );
      })}
    </div>
  );
}

function AnalyzingSkeleton() {
  return (
    <div aria-label="Analyzing">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] text-axiom-muted">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-axiom-green" />
        Analyzing…
      </p>
      <div className="space-y-2">
        <div className="axiom-skeleton h-3 w-full" />
        <div className="axiom-skeleton h-3 w-11/12" />
        <div className="axiom-skeleton h-3 w-4/5" />
        <div className="axiom-skeleton h-3 w-2/3" />
      </div>
    </div>
  );
}

/* Markdown-safe "live typing" reveal: blocks stagger in as the narrative
   arrives/upgrades (instant draft → LLM draft → draft + critic verdict). */
function NarrativeReveal({ narrative }) {
  const blocks = useMemo(
    () => narrative.split(/\n{2,}/).filter((b) => b.trim().length > 0),
    [narrative],
  );
  return (
    <div className="axiom-markdown text-xs [&_p]:my-2 [&_p]:text-[11px] [&_p]:leading-relaxed">
      {blocks.map((block, i) => (
        <motion.div
          key={`${i}-${block.slice(0, 24)}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: Math.min(i * 0.09, 0.45), ease: "easeOut" }}
        >
          <ReactMarkdown>{block}</ReactMarkdown>
        </motion.div>
      ))}
    </div>
  );
}

const PENDING_FALLBACK_MS = 25000;

export default function CoachPanel({ withCoach }) {
  const { shotSolution, coachNarrative, shotError, coachTimeoutError, stage } = useAgent();
  const { count, avgLabel } = useSessionShotStats(shotSolution);
  const [waitedOut, setWaitedOut] = useState(false);

  const failed = Boolean(shotError || coachTimeoutError) || waitedOut;
  const pending = Boolean(shotSolution && withCoach && !coachNarrative && !failed);
  const refining = Boolean(withCoach && coachNarrative && stage && stage !== "done" && !failed);

  // Display-only timeout: if the narrative never arrives, swap the skeleton
  // for the fallback instead of shimmering forever. Keyed on inputs (not
  // `pending`) so firing the fallback doesn't reset itself.
  useEffect(() => {
    setWaitedOut(false);
    if (!shotSolution || !withCoach || coachNarrative) return undefined;
    const t = setTimeout(() => setWaitedOut(true), PENDING_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [shotSolution, withCoach, coachNarrative]);

  return (
    <aside className="axiom-glass axiom-glow flex h-48 w-full shrink-0 flex-col border-t border-axiom-border xl:h-auto xl:w-72 xl:border-l xl:border-t-0">
      <div className="flex items-center justify-between gap-2 border-b border-axiom-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className={`h-4 w-4 text-axiom-green ${refining || pending ? "animate-pulse" : ""}`} />
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-axiom-text">AI Coach</h2>
        </div>
        <AnimatePresence>
          {withCoach && (pending || refining) && (
            <motion.div
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.2 }}
            >
              <StagePulse stage={stage} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="axiom-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {!shotSolution && (
          <p className="text-[11px] leading-relaxed text-axiom-muted">
            Set up a shot — cue ball, object ball, pocket — and the coach breaks
            down why it works before you take it.
          </p>
        )}

        {shotSolution && <SummaryCard solution={shotSolution} />}

        {pending && <AnalyzingSkeleton />}

        {shotSolution && failed && !coachNarrative && withCoach && (
          <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200/90">
            Coach narrative is taking longer than expected — physics above is still
            exact. Ensure the engine is running with a valid API key.
          </p>
        )}

        {coachNarrative && <NarrativeReveal narrative={coachNarrative} />}

        {refining && (
          <p className="flex items-center gap-1.5 text-[10px] italic text-axiom-muted/80">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-axiom-green/70" />
            Coach is refining the read…
          </p>
        )}

        {shotSolution && !withCoach && !coachNarrative && !pending && !failed && (
          <p className="text-[11px] leading-relaxed text-axiom-muted">
            Turn on <span className="text-axiom-green">AI Coach</span> in the
            toolbar and recompute for a narrated breakdown of this shot.
          </p>
        )}
      </div>

      <div className="border-t border-axiom-border/60 bg-axiom-panel/50 px-3 py-2 text-[10px] text-axiom-muted">
        {count} shot{count === 1 ? "" : "s"} analyzed this session · avg difficulty:{" "}
        <span className={TONE_CLASS[avgLabel.toLowerCase()] ?? "text-axiom-muted"}>{avgLabel}</span>
      </div>
    </aside>
  );
}
