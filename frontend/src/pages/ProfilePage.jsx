import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Settings,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import UserHubNav from "../components/user/UserHubNav.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { loadShotHistory } from "../lib/shotHistory.js";

function StatCard({ label, value, accent }) {
  return (
    <div className="axiom-glass rounded-xl border border-axiom-border p-4 text-center">
      <p className={`text-2xl font-bold tabular-nums ${accent ?? "text-axiom-green"}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-axiom-muted">{label}</p>
    </div>
  );
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuth();
  const history = useMemo(() => loadShotHistory(), []);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <User className="mx-auto h-10 w-10 text-axiom-muted/50" />
          <h1 className="mt-4 text-lg font-bold text-axiom-text">Sign in to view your profile</h1>
          <p className="mt-2 text-sm text-axiom-muted">
            Your stats, pot rate, and shot history sync to your account.
          </p>
          <Link
            to="/workspace"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-axiom-green to-axiom-green-dim px-5 py-2.5 text-sm font-semibold text-axiom-bg"
          >
            Go to workspace <ArrowRight className="h-4 w-4" />
          </Link>
      </div>
    );
  }

  const stats = user.stats ?? {};
  const potRate = stats.taken ? Math.round(((stats.potted ?? 0) / stats.taken) * 100) : null;
  const localPots = history.filter((h) => h.made).length;
  const localScratches = history.filter((h) => h.scratched).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside>
            <UserHubNav />
          </aside>

          <div>
            <motion.header
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="axiom-glass axiom-glow mb-6 rounded-2xl border border-axiom-border p-6 sm:p-8"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-axiom-green to-axiom-green-dim text-lg font-bold text-axiom-bg">
                  {initials(user.name)}
                </span>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.25em] text-axiom-green">Player profile</p>
                  <h1 className="mt-1 text-2xl font-bold text-axiom-text">{user.name}</h1>
                  <p className="text-sm text-axiom-muted">{user.email}</p>
                  {user.createdAt && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-axiom-muted/80">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-axiom-border px-3 py-2 text-xs text-axiom-muted transition hover:border-axiom-green/40 hover:text-axiom-green"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>
              </div>
            </motion.header>

            <section className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-axiom-muted">
                <TrendingUp className="h-4 w-4" /> Lifetime stats
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Analyzed" value={stats.analyzed ?? 0} />
                <StatCard label="Shots taken" value={stats.taken ?? 0} />
                <StatCard label="Potted" value={stats.potted ?? 0} accent="text-axiom-success" />
                <StatCard label="Scratches" value={stats.scratches ?? 0} accent="text-rose-300" />
              </div>
              {potRate !== null && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-axiom-muted">
                  <Target className="h-4 w-4 text-axiom-green" />
                  Pot rate: <span className="font-semibold text-axiom-text">{potRate}%</span>
                  <span className="text-axiom-muted/60">
                    ({stats.potted ?? 0} of {stats.taken} shots)
                  </span>
                </p>
              )}
            </section>

            <section className="mb-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-axiom-muted">
                This device — recent shots
              </h2>
              <div className="axiom-glass rounded-2xl border border-axiom-border p-4">
                {history.length === 0 ? (
                  <p className="text-sm text-axiom-muted">
                    No shots recorded on this browser yet. Head to the{" "}
                    <Link to="/workspace" className="text-axiom-green hover:underline">
                      workspace
                    </Link>{" "}
                    and take a few.
                  </p>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-axiom-muted">
                      Last {history.length} on this device · {localPots} potted · {localScratches}{" "}
                      scratches
                    </p>
                    <ul className="max-h-64 space-y-2 overflow-y-auto">
                      {history.map((shot, i) => (
                        <li
                          key={`${shot.at}-${i}`}
                          className="flex items-center justify-between rounded-lg border border-axiom-border/60 bg-axiom-bg/30 px-3 py-2 text-xs"
                        >
                          <span className="text-axiom-muted">
                            {new Date(shot.at).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          <span
                            className={
                              shot.scratched
                                ? "text-rose-300"
                                : shot.made
                                  ? "text-axiom-success"
                                  : "text-axiom-muted"
                            }
                          >
                            {shot.scratched ? "Scratch" : shot.made ? "Potted" : "Miss"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-axiom-green to-axiom-green-dim px-5 py-2.5 text-sm font-semibold text-axiom-bg"
              >
                Open workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 rounded-xl border border-axiom-border px-5 py-2.5 text-sm text-axiom-muted transition hover:border-axiom-green/40 hover:text-axiom-text"
              >
                Training drills
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
}
