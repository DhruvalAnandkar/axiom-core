import { useEffect, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { PHYSICS_RULES_COPY } from "./shotPhysicsCopy.js";
import { useShotUrlSync } from "./useShotUrlSync.js";

function findResultBanner() {
  try {
    const banners = document.querySelectorAll(".axiom-pwa-shell .text-sm.font-semibold");
    for (const el of banners) {
      const t = el.textContent ?? "";
      if (t.includes("Makeable") || t.includes("Not makeable")) return el.closest("div");
    }
  } catch {
    // no-op
  }
  return null;
}

function findDifficultyRow() {
  try {
    const nodes = document.querySelectorAll(".axiom-pwa-shell .text-axiom-muted");
    for (const el of nodes) {
      if (el.textContent?.includes("Difficulty:")) return el.closest("div");
    }
    const banner = findResultBanner();
    return banner;
  } catch {
    return null;
  }
}

function PhysicsInfoDrawer() {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  useEffect(() => {
    const align = () => {
      const row = findDifficultyRow();
      if (!row) {
        setAnchor(null);
        return;
      }
      const r = row.getBoundingClientRect();
      setAnchor({ top: r.top + r.height / 2, left: r.left + 8 });
    };
    align();
    window.addEventListener("resize", align);
    const obs = new MutationObserver(align);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", align);
      obs.disconnect();
    };
  }, []);

  if (!anchor) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-[65] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-axiom-border bg-axiom-surface text-axiom-muted hover:border-axiom-green/40 hover:text-axiom-green"
        style={{ top: anchor.top, left: anchor.left }}
        aria-label="How this works"
        title="How this works"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="axiom-glass h-full w-full max-w-md overflow-y-auto border-l border-axiom-border p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="How this works"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-axiom-text">How This Works</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-axiom-muted hover:text-axiom-text">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-xs text-axiom-muted">
              Four deterministic physics rules — the same ground truth the Researcher agent uses. No live agent calls here.
            </p>
            <ol className="space-y-4">
              {PHYSICS_RULES_COPY.map((rule, i) => (
                <li key={rule.title} className="rounded-lg border border-axiom-border bg-axiom-bg/50 p-3">
                  <p className="text-xs font-semibold text-axiom-green">
                    {i + 1}. {rule.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-axiom-muted">{rule.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}

export default function WorkspaceShotAddons() {
  useShotUrlSync(); // deep-link hydration + URL sync side effects

  return <PhysicsInfoDrawer />;
}
