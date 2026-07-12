import { ArrowRight, X } from "lucide-react";

const STEPS = [
  "Load a preset shot or click cue → object → pocket on the table.",
  "Vectors render instantly from the physics core.",
  "Toggle AI Coach for LangGraph narration and risk assessment.",
  "Click timeline events to open the coach analysis modal.",
];

export default function OnboardingModal({ open, onDismiss }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="axiom-glow axiom-glass w-full max-w-md rounded-2xl border border-axiom-border p-6 animate-fade-in">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-axiom-green">Welcome</p>
            <h2 className="mt-1 text-lg font-bold text-axiom-text">Quick start</h2>
          </div>
          <button type="button" onClick={onDismiss} className="text-axiom-muted hover:text-axiom-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-axiom-muted">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-axiom-green/10 text-xs font-bold text-axiom-green">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-axiom-green to-axiom-green-dim py-2.5 text-sm font-semibold text-axiom-bg"
        >
          Got it <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
