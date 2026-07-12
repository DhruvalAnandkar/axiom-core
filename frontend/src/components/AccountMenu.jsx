import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogOut, Settings, Target, User, X } from "lucide-react";
import { useAgent } from "../context/AgentProvider.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import AuthForm from "./AuthForm.jsx";

function initials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-lg border border-axiom-border bg-axiom-bg/50 p-2 text-center">
      <p className="text-base font-bold text-axiom-green tabular-nums">{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-axiom-muted">{label}</p>
    </div>
  );
}

export default function AccountMenu() {
  const { user, loading, logout, bumpStat } = useAuth();
  const { shotSolution } = useAgent();
  const [open, setOpen] = useState(false);
  const [signIn, setSignIn] = useState(false);
  const rootRef = useRef(null);
  const lastSolRef = useRef(null);

  // Every computed shot counts toward the profile.
  useEffect(() => {
    if (!shotSolution || shotSolution === lastSolRef.current) return;
    lastSolRef.current = shotSolution;
    bumpStat("analyzed");
  }, [shotSolution, bumpStat]);

  // Taken/potted/scratched come from the table's shot event.
  useEffect(() => {
    const onShot = (e) => {
      bumpStat("taken");
      if (e.detail?.made) bumpStat("potted");
      if (e.detail?.scratched) bumpStat("scratches");
    };
    window.addEventListener("axiom-shot-taken", onShot);
    return () => window.removeEventListener("axiom-shot-taken", onShot);
  }, [bumpStat]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const stats = user?.stats ?? {};
  const potRate = stats.taken ? Math.round(((stats.potted ?? 0) / stats.taken) * 100) : null;

  return (
    <div ref={rootRef} className="relative">
      {user ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-axiom-green to-axiom-green-dim text-[11px] font-bold text-axiom-bg transition hover:brightness-110"
          aria-label="Account menu"
          title={user.name}
        >
          {initials(user.name)}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setSignIn(true)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-axiom-border bg-axiom-surface px-2.5 py-1.5 text-[11px] font-medium text-axiom-text transition hover:border-axiom-green/40 hover:text-axiom-green disabled:opacity-50"
        >
          <User className="h-3.5 w-3.5" /> {loading ? "…" : "Sign in"}
        </button>
      )}

      <AnimatePresence>
        {open && user && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="axiom-glass axiom-glow absolute right-0 top-10 z-[70] w-64 rounded-xl border border-axiom-border p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-axiom-green to-axiom-green-dim text-xs font-bold text-axiom-bg">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-axiom-text">{user.name}</p>
                <p className="truncate text-[10px] text-axiom-muted">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatTile label="Analyzed" value={stats.analyzed ?? 0} />
              <StatTile label="Shots taken" value={stats.taken ?? 0} />
              <StatTile label="Potted" value={stats.potted ?? 0} />
              <StatTile label="Scratches" value={stats.scratches ?? 0} />
            </div>
            {potRate !== null && (
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-axiom-muted">
                <Target className="h-3 w-3 text-axiom-green" />
                Pot rate: <span className="font-semibold text-axiom-text">{potRate}%</span>
              </p>
            )}
            <div className="mt-3 flex flex-col gap-1.5 border-t border-axiom-border/60 pt-3">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-axiom-muted transition hover:bg-axiom-green/5 hover:text-axiom-green"
              >
                <User className="h-3 w-3" /> Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-axiom-muted transition hover:bg-axiom-green/5 hover:text-axiom-green"
              >
                <Settings className="h-3 w-3" /> Settings
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-axiom-border px-3 py-1.5 text-[11px] text-axiom-muted transition hover:border-rose-400/40 hover:text-rose-300"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {signIn && !user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
              onClick={() => setSignIn(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.97 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="axiom-glass axiom-glow w-full max-w-sm rounded-2xl border border-axiom-border p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-base font-bold text-axiom-text">Welcome to Axiom</h2>
                  <button
                    type="button"
                    onClick={() => setSignIn(false)}
                    className="text-axiom-muted hover:text-axiom-text"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mb-4 text-xs text-axiom-muted">
                  Your shots, pots, and scratches follow your account.
                </p>
                <AuthForm onDone={() => setSignIn(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
