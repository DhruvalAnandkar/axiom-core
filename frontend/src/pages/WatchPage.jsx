import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Play, Radio, Search, Tv, Youtube } from "lucide-react";

/* Channel IDs verified against youtube.com (externalId). The featured player
   embeds each channel's uploads playlist ("UU" + id suffix) — always valid,
   so the frame never renders broken when nothing is live. */
const CHANNELS = [
  {
    id: "UC-YHhXeWjF80OkVxR-HE2Xw",
    handle: "MatchroomPool1",
    name: "Matchroom Pool",
    desc: "World Nineball Tour — Mosconi Cup, World Pool Championship, US Open. Streams free side-table coverage live during events.",
    tags: ["Pro events"],
    live: true,
  },
  {
    id: "UCI6R2dargsn6o5eteEDAJ3Q",
    handle: "poolactiontv",
    name: "PoolActionTV",
    desc: "Free live coverage of pro tournaments and money matches across the US.",
    tags: ["Live matches"],
    live: true,
  },
  {
    id: "UCEQL74NNBBE-6szeVgH9Veg",
    handle: "AZBTV",
    name: "AZBilliards TV",
    desc: "Match archives and event coverage from pool's biggest news outlet.",
    tags: ["Matches", "News"],
    live: true,
  },
  {
    id: "UCeqobS0HX5bMpX-iEpjbqSg",
    handle: "DrDaveBilliards",
    name: "Dr. Dave Billiards",
    desc: "The physics of pool — ghost ball, tangent lines, squirt and spin. The same science behind Axiom's engine.",
    tags: ["Physics", "Instruction"],
  },
  {
    id: "UC-Enm4YB71mqjc2LBaXiVFg",
    handle: "MaximumBreak",
    name: "Maximum Break",
    desc: "High-production drills, patterns, and technique breakdowns for every level.",
    tags: ["Training"],
  },
  {
    id: "UCvHY60Bb4z7simxzpsRIb5Q",
    handle: "predatorcues",
    name: "Predator Cues",
    desc: "Pro Billiard Series event streams and cue-sport tech.",
    tags: ["Events", "Gear"],
  },
];

function uploadsPlaylist(channelId) {
  return `UU${channelId.slice(2)}`;
}

function TwitchPanel() {
  const [channel, setChannel] = useState("");
  const [live, setLive] = useState(null);
  const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";

  return (
    <div className="axiom-glass axiom-glow overflow-hidden rounded-2xl border border-axiom-border lg:col-span-3">
      <div className="flex flex-wrap items-center gap-3 border-b border-axiom-border px-4 py-3">
        <Tv className="h-4 w-4 text-axiom-green" />
        <p className="text-sm font-semibold text-axiom-text">Twitch — live billiards</p>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (channel.trim()) setLive(channel.trim().toLowerCase());
          }}
        >
          <input
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="Twitch channel name…"
            className="w-44 rounded-lg border border-axiom-border bg-axiom-bg/60 px-2.5 py-1.5 text-xs text-axiom-text placeholder:text-axiom-muted/60 focus:border-axiom-green/50 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg border border-axiom-border bg-axiom-surface px-2.5 py-1.5 text-[11px] text-axiom-text transition hover:border-axiom-green/40 hover:text-axiom-green"
          >
            <Search className="h-3 w-3" /> Watch
          </button>
        </form>
        <a
          href="https://www.twitch.tv/directory/category/billiards"
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1.5 text-[11px] text-axiom-muted transition hover:text-axiom-green"
        >
          Browse the Billiards category on Twitch <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {live ? (
        <div className="aspect-video w-full">
          <iframe
            key={live}
            src={`https://player.twitch.tv/?channel=${encodeURIComponent(live)}&parent=${parent}&muted=true`}
            title={`Twitch — ${live}`}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-center">
          <Tv className="h-8 w-8 text-axiom-muted/50" />
          <p className="text-sm text-axiom-muted">
            Enter a Twitch channel above, or browse the Billiards category to find live tables.
          </p>
        </div>
      )}
    </div>
  );
}

export default function WatchPage() {
  const [active, setActive] = useState(CHANNELS[0]);
  const [source, setSource] = useState("youtube");
  const embedSrc = useMemo(
    () => `https://www.youtube.com/embed/videoseries?list=${uploadsPlaylist(active.id)}`,
    [active],
  );

  useEffect(() => {
    const prev = document.title;
    document.title = "Axiom — Watch Pool";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-axiom-green">
          <Radio className="h-3.5 w-3.5" /> Watch
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-axiom-text sm:text-3xl">
          Live pool, pro matches, and the <span className="axiom-gradient-text">science of the game</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-axiom-muted">
          Free channels curated for Axiom — world-class nineball, live event coverage,
          and the physics instruction our engine is built on.
        </p>
      </header>

      <div className="mb-5 flex items-center gap-2">
        {[
          { id: "youtube", label: "YouTube channels", Icon: Youtube },
          { id: "twitch", label: "Twitch live", Icon: Tv },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSource(id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              source === id
                ? "border-axiom-green/50 bg-axiom-green/10 text-axiom-green"
                : "border-axiom-border text-axiom-muted hover:border-axiom-green/30 hover:text-axiom-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {source === "twitch" && <TwitchPanel />}
        {source === "youtube" && (
        <motion.div
          key={active.id}
          initial={{ opacity: 0.4, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <div className="axiom-glass axiom-glow overflow-hidden rounded-2xl border border-axiom-border">
            <div className="aspect-video w-full">
              <iframe
                key={embedSrc}
                src={embedSrc}
                title={`${active.name} — latest videos`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-axiom-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-axiom-text">{active.name}</p>
                <p className="text-[11px] text-axiom-muted">Latest uploads & stream replays</p>
              </div>
              <a
                href={`https://www.youtube.com/@${active.handle}/streams`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-axiom-border bg-axiom-surface px-3 py-1.5 text-[11px] text-axiom-text transition hover:border-axiom-green/40 hover:text-axiom-green"
              >
                {active.live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />}
                Live streams on YouTube <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </motion.div>
        )}

        {source === "youtube" && (
        <div className="flex flex-col gap-3">
          {CHANNELS.map((ch, i) => (
            <motion.button
              key={ch.id}
              type="button"
              onClick={() => setActive(ch)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i, ease: "easeOut" }}
              className={`axiom-glass axiom-lift group rounded-xl border p-3.5 text-left transition ${
                active.id === ch.id
                  ? "border-axiom-green/50 shadow-[0_0_18px_#22d3ee22]"
                  : "border-axiom-border hover:border-axiom-green/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-axiom-text">
                  <Play className={`h-3.5 w-3.5 ${active.id === ch.id ? "text-axiom-green" : "text-axiom-muted group-hover:text-axiom-green"}`} />
                  {ch.name}
                </p>
                {ch.live && (
                  <span className="flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-300">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-rose-400" /> Live events
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-axiom-muted">{ch.desc}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ch.tags.map((t) => (
                  <span key={t} className="rounded-full bg-axiom-surface px-2 py-0.5 text-[9px] uppercase tracking-wider text-axiom-muted">
                    {t}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
