import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Circle,
  Crosshair,
  ExternalLink,
  GraduationCap,
  Radio,
  Ruler,
  Target,
} from "lucide-react";
import SpotlightCard from "../components/SpotlightCard.jsx";

const TONE = {
  Easy: "border-axiom-success/40 bg-axiom-success/10 text-axiom-success",
  Medium: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  Hard: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

/* Coordinates deep-link into the workspace via the shot-URL contract
   (cue/obj/pocket params) — the drill loads on the table, ready to compute. */
const DRILLS = [
  {
    title: "Stop Shot Control",
    tag: "Easy",
    goal: "Pot the ball dead straight and freeze the cue on contact.",
    detail: "The foundation of position play. With zero cut angle the tangent line vanishes — a stun hit leaves the cue exactly where the object ball was.",
    shot: { cue: "4,9", obj: "18,9", pocket: "34,9" },
  },
  {
    title: "Corner-Pocket Straight-In",
    tag: "Easy",
    goal: "Long straight-in to the top-right corner. Groove your stroke line.",
    detail: "Distance amplifies stroke errors. Same zero-cut geometry as the stop shot, but the longer aim line exposes any steering.",
    shot: { cue: "12,6", obj: "24,12", pocket: "36,18" },
  },
  {
    title: "Half-Ball Cut",
    tag: "Medium",
    goal: "A classic ~45° cut. Learn what a half-ball overlap looks like.",
    detail: "The half-ball hit is the reference cut every fractional-aiming system is built around. Watch how far the ghost ball sits from the contact point.",
    shot: { cue: "4,1.5", obj: "10,5", pocket: "20,5" },
  },
  {
    title: "Side-Pocket Cut",
    tag: "Medium",
    goal: "Feed the object ball into the side pocket at ~30°.",
    detail: "Side pockets punish angle errors — their effective opening shrinks fast as the approach angle steepens. Precision over power.",
    shot: { cue: "4,12", obj: "14,6", pocket: "18,0" },
  },
  {
    title: "Thin Cut Challenge",
    tag: "Hard",
    goal: "Back-cut past 60°. Tiny ghost-ball overlap, huge payoff.",
    detail: "On thin cuts the cue ball keeps most of its speed along the tangent — plan where it's going before you shoot, not after.",
    shot: { cue: "2,2", obj: "14,9", pocket: "34,1" },
  },
  {
    title: "Bank Angle Reading",
    tag: "Hard",
    goal: "Read the rail-first geometry on a steep crossing line.",
    detail: "Mirror-image aiming: the pocket reflects across the rail. Axiom shows you the incoming and outgoing angles so you can verify the mirror.",
    shot: { cue: "3,3", obj: "15,12", pocket: "34,3" },
  },
];

const SYSTEMS = [
  {
    icon: Circle,
    title: "Ghost ball",
    desc: "Imagine a phantom ball touching the object ball exactly opposite the pocket — drive the cue's center through it. This is the system Axiom draws on the table for every shot.",
  },
  {
    icon: Ruler,
    title: "Fractional aiming",
    desc: "Read the overlap between cue and object ball: full ball = straight, half ball ≈ 30° cut, quarter ball ≈ 49°. A fast mental lookup for common angles.",
  },
  {
    icon: Target,
    title: "Contact point",
    desc: "Aim the contact point on the object ball directly away from the pocket, then adjust for the curve of both spheres. Precise, but demands practice — the ghost ball does the correction for you.",
  },
];

/* Uploads playlists ("UU" + channel-id suffix) — always valid embeds. */
const LESSON_CHANNELS = [
  {
    id: "UCeqobS0HX5bMpX-iEpjbqSg",
    name: "Dr. Dave Billiards",
    desc: "The physics behind every Axiom overlay — ghost ball, tangent lines, squirt and spin.",
  },
  {
    id: "UC-Enm4YB71mqjc2LBaXiVFg",
    name: "Maximum Break",
    desc: "High-production drills and technique breakdowns, from fundamentals to pro patterns.",
  },
];

const RESOURCES = [
  { label: "Dr. Dave — pool physics resources", href: "https://drdavepoolinfo.com" },
  { label: "WPA — official rules of play", href: "https://wpapool.com/rules-of-play" },
  { label: "FargoRate — world player ratings", href: "https://www.fargorate.com" },
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" },
};

export default function LearnPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Axiom — Training Hub";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-axiom-green">
          <GraduationCap className="h-3.5 w-3.5" /> Training Hub
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-axiom-text sm:text-3xl">
          Drills that load <span className="axiom-gradient-text">straight onto the table</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-axiom-muted">
          Every drill deep-links into the workspace with the exact ball positions —
          one click and the physics engine is showing you the shot.
        </p>
      </header>

      <section className="mb-10">
        <motion.h2 {...reveal} className="mb-4 text-sm font-semibold uppercase tracking-widest text-axiom-muted">
          Aiming systems
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {SYSTEMS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} {...reveal} transition={{ ...reveal.transition, delay: 0.08 * i }}>
              <SpotlightCard className="axiom-glass axiom-lift h-full rounded-xl border border-axiom-border p-5 hover:border-axiom-green/30">
                <Icon className="h-5 w-5 text-axiom-green" />
                <h3 className="mt-3 text-sm font-semibold text-axiom-text">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-axiom-muted">{desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <motion.h2 {...reveal} className="mb-4 text-sm font-semibold uppercase tracking-widest text-axiom-muted">
          Drills — click to load
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DRILLS.map((d, i) => (
            <motion.div key={d.title} {...reveal} transition={{ ...reveal.transition, delay: 0.06 * i }}>
              <SpotlightCard className="axiom-glass axiom-lift group flex h-full flex-col rounded-xl border border-axiom-border p-5 hover:border-axiom-green/30">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-axiom-text">{d.title}</h3>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TONE[d.tag]}`}>
                    {d.tag}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-axiom-text/90">{d.goal}</p>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-axiom-muted">{d.detail}</p>
                <Link
                  to={`/workspace?cue=${d.shot.cue}&obj=${d.shot.obj}&pocket=${d.shot.pocket}`}
                  className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg border border-axiom-border bg-axiom-surface px-3 py-1.5 text-[11px] font-medium text-axiom-text transition group-hover:border-axiom-green/40 group-hover:text-axiom-green"
                >
                  <Crosshair className="h-3 w-3" /> Load on table <ArrowRight className="h-3 w-3" />
                </Link>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <motion.h2 {...reveal} className="mb-4 text-sm font-semibold uppercase tracking-widest text-axiom-muted">
          Video lessons
        </motion.h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {LESSON_CHANNELS.map((ch, i) => (
            <motion.div key={ch.id} {...reveal} transition={{ ...reveal.transition, delay: 0.08 * i }}>
              <div className="axiom-glass axiom-lift overflow-hidden rounded-2xl border border-axiom-border hover:border-axiom-green/30">
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/videoseries?list=UU${ch.id.slice(2)}`}
                    title={`${ch.name} — lessons`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-axiom-text">{ch.name}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-axiom-muted">{ch.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section {...reveal} className="mb-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="axiom-glass axiom-glow flex flex-col justify-between gap-4 rounded-2xl border border-axiom-border p-6 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-axiom-green">
              <Radio className="h-3.5 w-3.5" /> Watch and learn
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-axiom-text">
              See the pros play these exact patterns
            </h2>
            <p className="mt-1 text-xs text-axiom-muted">
              Live nineball, match archives, and the physics channels behind Axiom's engine.
            </p>
          </div>
          <Link
            to="/watch"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-axiom-green to-axiom-green-dim px-5 py-2.5 text-sm font-semibold text-axiom-bg"
          >
            Open Watch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="axiom-glass rounded-2xl border border-axiom-border p-6">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-axiom-muted">
            <BookOpen className="h-3.5 w-3.5" /> Go deeper
          </p>
          <ul className="mt-3 space-y-2">
            {RESOURCES.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-axiom-muted transition hover:text-axiom-green"
                >
                  {r.label} <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>
    </div>
  );
}
