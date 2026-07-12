import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  Download,
  LogOut,
  Palette,
  RotateCcw,
  Settings,
  Shield,
  Sliders,
  Trash2,
  User,
} from "lucide-react";
import SettingRow from "../components/settings/SettingRow.jsx";
import Toggle from "../components/settings/Toggle.jsx";
import UserHubNav from "../components/user/UserHubNav.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { usePreferences } from "../context/PreferencesProvider.jsx";
import { loadShotHistory } from "../lib/shotHistory.js";
import { toast } from "sonner";

const SECTIONS = [
  { id: "workspace", label: "Workspace", Icon: Sliders },
  { id: "appearance", label: "Appearance", Icon: Palette },
  { id: "privacy", label: "Privacy & data", Icon: Shield },
  { id: "account", label: "Account", Icon: User },
  { id: "about", label: "About", Icon: Bell },
];

function SectionCard({ title, description, children }) {
  return (
    <div className="axiom-glass rounded-2xl border border-axiom-border p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-axiom-text">{title}</h2>
      {description && <p className="mt-1 text-xs text-axiom-muted">{description}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { prefs, setPref, resetAll, clearLocalData } = usePreferences();
  const { user, logout } = useAuth();
  const [section, setSection] = useState("workspace");

  const exportData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            account: user
              ? { name: user.name, email: user.email, stats: user.stats }
              : null,
            preferences: prefs,
            recentShots: loadShotHistory(),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axiom-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-axiom-green">
            <Settings className="h-3.5 w-3.5" /> Your space
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-axiom-text sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-axiom-muted">
            Tune how Axiom behaves for you. Nothing here changes the core table or coach —
            these are your personal defaults and display options.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-4">
            <UserHubNav />
            <div className="hidden flex-col gap-1 lg:flex">
              {SECTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                    section === id
                      ? "bg-axiom-green/10 text-axiom-green"
                      : "text-axiom-muted hover:text-axiom-text"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </aside>

          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {section === "workspace" && (
              <>
                <SectionCard
                  title="Workspace defaults"
                  description="Applied when you open the table or camera."
                >
                  <SettingRow
                    label="AI coach on by default"
                    description="Start with the multi-agent coach pipeline enabled for every shot."
                    htmlFor="pref-coach"
                  >
                    <Toggle
                      id="pref-coach"
                      checked={prefs.defaultCoach}
                      onChange={(v) => setPref("defaultCoach", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Sound effects"
                    description="Pot clacks and table audio during shot playback."
                    htmlFor="pref-sound"
                  >
                    <Toggle
                      id="pref-sound"
                      checked={prefs.soundEffects}
                      onChange={(v) => setPref("soundEffects", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Read coach aloud"
                    description="Use speech synthesis when coach narrative arrives."
                    htmlFor="pref-read"
                  >
                    <Toggle
                      id="pref-read"
                      checked={prefs.readAloud}
                      onChange={(v) => setPref("readAloud", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Auto-open coach analysis"
                    description="Pop the full coach modal as soon as narrative is ready."
                    htmlFor="pref-modal"
                  >
                    <Toggle
                      id="pref-modal"
                      checked={prefs.autoOpenCoachModal}
                      onChange={(v) => setPref("autoOpenCoachModal", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Confirm before new shot"
                    description="Ask before clearing the current aim when starting over."
                    htmlFor="pref-confirm"
                  >
                    <Toggle
                      id="pref-confirm"
                      checked={prefs.confirmNewShot}
                      onChange={(v) => setPref("confirmNewShot", v)}
                    />
                  </SettingRow>
                </SectionCard>
                <SectionCard title="Tips & onboarding" description="First-run guidance on the workspace.">
                  <SettingRow
                    label="Show workspace tips"
                    description="Display the quick-start overlay when you haven't dismissed it yet."
                    htmlFor="pref-tips"
                  >
                    <Toggle
                      id="pref-tips"
                      checked={prefs.showOnboarding}
                      onChange={(v) => setPref("showOnboarding", v)}
                    />
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {section === "appearance" && (
              <SectionCard title="Display" description="Visual comfort without changing functionality.">
                <SettingRow
                  label="Reduce motion"
                  description="Tone down aurora, particles, and UI animations."
                  htmlFor="pref-motion"
                >
                  <Toggle
                    id="pref-motion"
                    checked={prefs.reduceMotion}
                    onChange={(v) => setPref("reduceMotion", v)}
                  />
                </SettingRow>
                <SettingRow
                  label="Background particles"
                  description="Floating ambient dots behind the canvas."
                  htmlFor="pref-particles"
                >
                  <Toggle
                    id="pref-particles"
                    checked={prefs.showParticles}
                    onChange={(v) => setPref("showParticles", v)}
                  />
                </SettingRow>
                <SettingRow
                  label="Compact navigation"
                  description="Tighter spacing in the top navigation bar."
                  htmlFor="pref-nav"
                >
                  <Toggle
                    id="pref-nav"
                    checked={prefs.compactNav}
                    onChange={(v) => setPref("compactNav", v)}
                  />
                </SettingRow>
              </SectionCard>
            )}

            {section === "privacy" && (
              <>
                <SectionCard title="Your data" description="Everything below stays on this device unless you export it.">
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={exportData}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-axiom-border bg-axiom-surface px-3 py-2 text-xs text-axiom-text transition hover:border-axiom-green/40 hover:text-axiom-green"
                    >
                      <Download className="h-3.5 w-3.5" /> Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearLocalData();
                        toast.success("Local session data cleared");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-axiom-border bg-axiom-surface px-3 py-2 text-xs text-axiom-muted transition hover:border-amber-400/40 hover:text-amber-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear local history
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetAll();
                        toast.success("Preferences reset to defaults");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-axiom-border bg-axiom-surface px-3 py-2 text-xs text-axiom-muted transition hover:border-rose-400/40 hover:text-rose-300"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset all settings
                    </button>
                  </div>
                </SectionCard>
                <SectionCard title="Account stats" description="Lifetime stats sync when you're signed in.">
                  <p className="text-xs leading-relaxed text-axiom-muted">
                    Shots analyzed, taken, potted, and scratches are stored on your account
                    when the backend is running. Local shot history (last 30 on this device) is
                    separate and can be cleared above.
                  </p>
                </SectionCard>
              </>
            )}

            {section === "account" && (
              <SectionCard title="Account" description="Manage your player profile.">
                {user ? (
                  <>
                    <div className="rounded-xl border border-axiom-border bg-axiom-bg/40 p-4">
                      <p className="text-sm font-semibold text-axiom-text">{user.name}</p>
                      <p className="text-xs text-axiom-muted">{user.email}</p>
                      {user.createdAt && (
                        <p className="mt-2 text-[10px] text-axiom-muted/80">
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to="/profile"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-axiom-green/40 bg-axiom-green/10 px-3 py-2 text-xs font-medium text-axiom-green"
                      >
                        <User className="h-3.5 w-3.5" /> View profile
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-axiom-border px-3 py-2 text-xs text-axiom-muted transition hover:border-rose-400/40 hover:text-rose-300"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-axiom-muted">
                    You're browsing as a guest.{" "}
                    <Link to="/workspace" className="text-axiom-green hover:underline">
                      Sign in from the workspace
                    </Link>{" "}
                    to sync stats across sessions.
                  </p>
                )}
              </SectionCard>
            )}

            {section === "about" && (
              <SectionCard title="About Axiom" description="Hackathon billiards physics + AI coaching stack.">
                <ul className="space-y-2 text-xs text-axiom-muted">
                  <li>React + Vite frontend · Node/Socket.io broker · FastAPI/LangGraph engine</li>
                  <li>Deterministic Python physics — ghost ball, cut angle, tangent lines</li>
                  <li>Version 1.0 · United Hacks build</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/docs"
                    className="rounded-lg border border-axiom-border px-3 py-2 text-xs text-axiom-muted hover:border-axiom-green/40 hover:text-axiom-green"
                  >
                    Documentation
                  </Link>
                  <Link
                    to="/help"
                    className="rounded-lg border border-axiom-border px-3 py-2 text-xs text-axiom-muted hover:border-axiom-green/40 hover:text-axiom-green"
                  >
                    Help center
                  </Link>
                  <Link
                    to="/shortcuts"
                    className="rounded-lg border border-axiom-border px-3 py-2 text-xs text-axiom-muted hover:border-axiom-green/40 hover:text-axiom-green"
                  >
                    Keyboard shortcuts
                  </Link>
                </div>
              </SectionCard>
            )}
          </motion.div>
        </div>
    </div>
  );
}
