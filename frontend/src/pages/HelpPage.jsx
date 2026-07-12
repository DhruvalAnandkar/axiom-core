import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Camera,
  Crosshair,
  GraduationCap,
  HelpCircle,
  Radio,
  Settings,
  Zap,
} from "lucide-react";
import UserHubNav from "../components/user/UserHubNav.jsx";

const FAQ = [
  {
    q: "Why do I need to sign in?",
    a: "The workspace is players-only so your shot stats (analyzed, taken, potted, scratches) follow your account. Watch and Train are open to everyone.",
  },
  {
    q: "The coach says unavailable — what now?",
    a: "Physics always works. The AI coach needs an OpenAI key with billing on the engine. Without it, Axiom falls back to deterministic coach text.",
  },
  {
    q: "Broker offline banner?",
    a: "Start the Node backend on port 3001 (npm start in backend/). The frontend talks to it for live telemetry and auth.",
  },
  {
    q: "Can I share a shot with someone?",
    a: "Yes — the workspace URL updates with cue, object, and pocket coordinates. Copy the link from your browser.",
  },
  {
    q: "Where are my settings stored?",
    a: "Display and workspace defaults live in your browser (localStorage). Account stats sync to the server when signed in.",
  },
];

const QUICK_LINKS = [
  { to: "/workspace", label: "Workspace", Icon: Crosshair, desc: "Aim and compute shots" },
  { to: "/camera", label: "Camera setup", Icon: Camera, desc: "Photo aim overlay" },
  { to: "/learn", label: "Training hub", Icon: GraduationCap, desc: "Drills that load on the table" },
  { to: "/watch", label: "Watch", Icon: Radio, desc: "Live pool channels" },
  { to: "/settings", label: "Settings", Icon: Settings, desc: "Your preferences" },
  { to: "/docs", label: "Docs", Icon: BookOpen, desc: "Architecture overview" },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside>
            <UserHubNav />
          </aside>
          <div>
            <header className="mb-8">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-axiom-green">
                <HelpCircle className="h-3.5 w-3.5" /> Support
              </p>
              <h1 className="mt-2 text-2xl font-bold text-axiom-text">Help center</h1>
              <p className="mt-2 text-sm text-axiom-muted">
                Common questions and quick links to get unstuck.
              </p>
            </header>

            <section className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-axiom-muted">
                Quick links
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {QUICK_LINKS.map(({ to, label, Icon, desc }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={to}
                      className="axiom-glass axiom-lift flex items-start gap-3 rounded-xl border border-axiom-border p-4 transition hover:border-axiom-green/30"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-axiom-green" />
                      <div>
                        <p className="text-sm font-semibold text-axiom-text">{label}</p>
                        <p className="text-xs text-axiom-muted">{desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-axiom-muted">
                FAQ
              </h2>
              <div className="space-y-3">
                {FAQ.map((item, i) => (
                  <motion.details
                    key={item.q}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="axiom-glass group rounded-xl border border-axiom-border p-4"
                  >
                    <summary className="cursor-pointer list-none text-sm font-medium text-axiom-text marker:content-none">
                      <span className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-axiom-green opacity-70" />
                        {item.q}
                      </span>
                    </summary>
                    <p className="mt-3 pl-5 text-xs leading-relaxed text-axiom-muted">{item.a}</p>
                  </motion.details>
                ))}
              </div>
            </section>

            <section className="axiom-glass rounded-2xl border border-axiom-border p-5">
              <h2 className="text-sm font-semibold text-axiom-text">Running locally</h2>
              <ol className="mt-3 space-y-2 text-xs text-axiom-muted">
                <li>1. Engine: <code className="text-axiom-text">uvicorn app:app --port 8000</code> in engine/</li>
                <li>2. Backend: <code className="text-axiom-text">npm start</code> in backend/ (port 3001)</li>
                <li>3. Frontend: <code className="text-axiom-text">npm run dev</code> in frontend/ (port 3000)</li>
              </ol>
            </section>
          </div>
        </div>
    </div>
  );
}
