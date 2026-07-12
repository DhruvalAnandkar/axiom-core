import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Crosshair,
  GraduationCap,
  MousePointerClick,
  Radio,
  Sigma,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import SpotlightCard from "../components/SpotlightCard.jsx";
import { useMagnetic } from "../hooks/useMagnetic.js";

const FEATURES = [
  { icon: Crosshair, title: "Click-to-aim", desc: "Set cue, object, and pocket on a live billiards table. Vectors render before you blink." },
  { icon: Brain, title: "Deterministic physics", desc: "Ghost ball, cut angle, and tangent lines computed in Python — no LLM math, ever." },
  { icon: Radio, title: "AI coach pipeline", desc: "Researcher, Draftsman, and Critic agents narrate and risk-check every shot." },
];

const STEPS = [
  { icon: MousePointerClick, title: "Aim in three clicks", desc: "Cue ball, object ball, pocket. Presets for straight-ins, thin cuts, and banks." },
  { icon: Sigma, title: "Physics answers instantly", desc: "The deterministic core solves ghost ball, cut angle, and tangent in milliseconds." },
  { icon: Sparkles, title: "The coach breaks it down", desc: "A multi-agent pipeline narrates why the shot works and where the risk is." },
];

const STATS = [
  { value: 100, suffix: " ms", prefix: "<", label: "click to rendered vectors" },
  { value: 0, suffix: "", prefix: "", label: "LLM calls in the physics core" },
  { value: 3, suffix: "", prefix: "", label: "coaching agents per shot" },
  { value: 6, suffix: "", prefix: "", label: "curated live pool channels" },
];

const MARQUEE = [
  "Matchroom Pool", "PoolActionTV", "AZBilliards TV", "Dr. Dave Billiards",
  "Maximum Break", "Predator Cues", "Ghost ball", "90° tangent rule",
  "Cut-angle difficulty", "Cue-spin prediction",
];

function CountUp({ value, prefix, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    if (value === 0) {
      setN(0);
      return undefined;
    }
    const t0 = performance.now();
    const dur = 1200;
    let raf;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

/* Looping mini-table: aim lines draw themselves, the cue ball strikes the
   ghost point, the object ball rolls off and sinks in the corner pocket. */
function HeroTableLoop() {
  return (
    <svg
      viewBox="0 0 360 180"
      className="h-auto w-full"
      role="img"
      aria-label="Animated billiards shot: cue ball strikes through the ghost ball and the object ball rolls into the pocket"
    >
      <rect x="2" y="2" width="356" height="176" rx="12" fill="#1a1040" opacity="0.55" />
      <rect x="10" y="10" width="340" height="160" rx="7" fill="#0f5132" opacity="0.85" />
      {[[14, 14], [180, 11], [346, 14], [14, 166], [180, 169], [346, 166]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#05070c" />
      ))}
      <circle cx="346" cy="14" r="12" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="axiom-hero-pocket" />

      {/* aim line: cue → ghost; object line: object → pocket; tangent hint */}
      <line x1="50" y1="140" x2="166" y2="96" stroke="#22d3ee" strokeWidth="1.6" strokeDasharray="5 4" pathLength="140" className="axiom-hero-aim" />
      <line x1="180" y1="90" x2="338" y2="22" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="5 4" pathLength="140" className="axiom-hero-aim" style={{ animationDelay: "0.35s" }} />
      <line x1="180" y1="90" x2="214" y2="132" stroke="#8b5cf6" strokeWidth="1.4" strokeDasharray="4 4" pathLength="140" className="axiom-hero-aim" style={{ animationDelay: "0.6s" }} />

      {/* ghost ball marker */}
      <circle cx="166" cy="96" r="7" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />

      {/* cue stick */}
      <g className="axiom-hero-stick">
        <line x1="-6" y1="161" x2="44" y2="142" stroke="#d4a574" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* balls */}
      <g className="axiom-hero-cue">
        <circle cx="50" cy="140" r="7" fill="#f8fafc" />
      </g>
      <g className="axiom-hero-object">
        <circle cx="180" cy="90" r="7" fill="#f59e0b" />
      </g>
    </svg>
  );
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" },
};

export default function LandingPage() {
  const magnetic = useMagnetic(0.2, 1.05);
  const [par, setPar] = useState({ x: 0, y: 0 });

  const onHeroMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPar({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  }, []);

  return (
    <div className="axiom-gradient-bg min-h-screen overflow-x-clip">
      <Navbar />

      <section onMouseMove={onHeroMove} className="relative mx-auto max-w-6xl px-6 pb-10 pt-14">
        <div style={{ transform: `translate(${par.x * -18}px, ${par.y * -12}px)`, transition: "transform 0.4s ease-out" }}>
          <div
            className="axiom-drift left-[8%] top-[10%] h-56 w-56"
            style={{ background: "radial-gradient(circle, #22d3ee14, transparent 70%)", animation: "axiom-drift-slow 26s ease-in-out infinite" }}
          />
          <div
            className="axiom-drift right-[4%] top-[26%] h-72 w-72"
            style={{ background: "radial-gradient(circle, #8b5cf61f, transparent 70%)", animation: "axiom-drift-slower 34s ease-in-out infinite" }}
          />
        </div>
        <div
          className="axiom-drift bottom-[-12%] left-[35%] h-64 w-64"
          style={{ background: "radial-gradient(circle, #6d28d926, transparent 70%)", animation: "axiom-drift-slow 44s ease-in-out infinite", transform: `translate(${par.x * 14}px, ${par.y * 10}px)` }}
        />

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <motion.p {...reveal} className="text-xs uppercase tracking-[0.3em] text-axiom-green">
              Precision Athletics
            </motion.p>
            <motion.h1
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.08 }}
              className="mt-4 text-4xl font-bold leading-tight tracking-tight text-axiom-text sm:text-5xl xl:text-6xl"
            >
              See why the shot works.
              <br />
              <span className="axiom-gradient-text">Before you take it.</span>
            </motion.h1>
            <motion.p
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.16 }}
              className="mx-auto mt-5 max-w-xl text-axiom-muted lg:mx-0"
            >
              Deterministic billiards physics plus multi-agent coaching.
              Vectors render instantly; the narrative streams in behind them.
            </motion.p>
            <motion.div
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Link
                to="/workspace"
                {...magnetic}
                className="axiom-magnetic inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-axiom-green to-axiom-green-dim px-6 py-3 text-sm font-semibold text-axiom-bg"
              >
                Open Table <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/watch"
                className="inline-flex items-center gap-2 rounded-xl border border-axiom-border bg-axiom-surface/60 px-5 py-3 text-sm font-medium text-axiom-text transition hover:border-axiom-green/40 hover:text-axiom-green"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                Watch live pool
              </Link>
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 rounded-xl border border-axiom-border bg-axiom-surface/60 px-5 py-3 text-sm font-medium text-axiom-text transition hover:border-axiom-green/40 hover:text-axiom-green"
              >
                <GraduationCap className="h-4 w-4" /> Train
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="axiom-glass axiom-glow axiom-float rounded-2xl border border-axiom-border p-3"
            style={{ animationDelay: "1.2s" }}
          >
            <HeroTableLoop />
            <div className="flex items-center justify-between px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-axiom-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-axiom-success" /> Live physics preview
              </span>
              <span>ghost ball · tangent · cut angle</span>
            </div>
          </motion.div>
        </div>

        <motion.dl
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.1 }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="axiom-glass rounded-xl border border-axiom-border p-4 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-bold text-axiom-green">
                <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </dd>
              <p className="mt-1 text-[11px] leading-snug text-axiom-muted">{s.label}</p>
            </div>
          ))}
        </motion.dl>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <motion.h2 {...reveal} className="text-center text-2xl font-bold tracking-tight text-axiom-text">
          Three clicks to a <span className="axiom-gradient-text">coached shot</span>
        </motion.h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.12 * i }}
            >
              <SpotlightCard className="axiom-glass axiom-lift h-full rounded-xl border border-axiom-border p-5 hover:border-axiom-green/30">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-axiom-green/20 to-axiom-green-dim/20">
                  <Icon className="h-4.5 w-4.5 text-axiom-green" />
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-axiom-muted">Step {i + 1}</p>
                <h3 className="mt-1 text-sm font-semibold text-axiom-text">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-axiom-muted">{desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} {...reveal} transition={{ ...reveal.transition, delay: 0.1 * i }}>
              <SpotlightCard className="axiom-glass axiom-lift h-full rounded-xl border border-axiom-border p-5 hover:border-axiom-green/30">
                <Icon className="axiom-float h-5 w-5 text-axiom-green" style={{ animationDelay: `${i * 0.6}s` }} />
                <h3 className="mt-3 text-sm font-semibold text-axiom-text">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-axiom-muted">{desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-axiom-border/60 bg-axiom-surface/30 py-4">
        <div className="overflow-hidden" aria-hidden="true">
          <div className="axiom-marquee gap-10 pr-10">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="whitespace-nowrap text-xs uppercase tracking-[0.2em] text-axiom-muted/70">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <motion.div {...reveal} className="axiom-glass axiom-glow rounded-2xl border border-axiom-border px-8 py-12">
          <h2 className="text-2xl font-bold tracking-tight text-axiom-text sm:text-3xl">
            Your next rack, <span className="axiom-gradient-text">solved</span>.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-axiom-muted">
            Open the table, set three points, and watch the physics — then let
            the coach tell you exactly how to play it.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/workspace"
              {...magnetic}
              className="axiom-magnetic inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-axiom-green to-axiom-green-dim px-6 py-3 text-sm font-semibold text-axiom-bg"
            >
              Start aiming <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/docs"
              className="text-sm text-axiom-muted transition hover:text-axiom-green"
            >
              Read the physics docs
            </Link>
          </div>
        </motion.div>
        <p className="mt-10 text-[11px] text-axiom-muted/60">
          Axiom — Precision Athletics · deterministic physics core · built for United Hacks V7
        </p>
      </section>
    </div>
  );
}
