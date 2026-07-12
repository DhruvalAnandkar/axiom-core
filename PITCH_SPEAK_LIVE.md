# Axiom — Live Demo Speech (you speak this while navigating)

Read naturally. Brackets [like this] = what to click or show on screen. Pause where you see ...

---

## PART 1 — YOUR STORY (about 45 seconds)

Hi, I'm Dhruval.

So this summer I started learning pool — just for fun with friends. And I was bad at it. I'd miss a shot, pull out my phone, and scroll Instagram or TikTok. Everyone had a different tip. Hit it like this. Use this cue. Try this drill. But none of it was about the shot I had just missed. I wasn't really learning. I was just collecting random advice.

What I figured out is — pool is hard because you can't *see* where to aim. Pros see geometry in their head. Ghost ball. Cut angle. Where the cue ball goes after contact. I just saw two balls and a pocket and hoped for the best.

That's why I built Axiom. I wanted to see the shot before I take it — and actually track if I'm getting better.

Okay — let me show you what I built.

---

## PART 2 — LANDING PAGE (about 30 seconds)

[Stay on home page /]

This is the landing page. Up top you've got the Axiom logo with the lightning bolt. The nav bar has **Workspace**, **Camera Setup**, **Watch** — that little red dot means live pool content — **Train** with the graduation cap icon, and **Docs**.

The headline says: *See why the shot works. Before you take it.* That's the whole idea.

On the right you've got a live animated table preview — cue ball, ghost ball, object ball rolling to the pocket. Same visual language the real app uses.

Scroll down — three feature cards: click-to-aim, deterministic physics, and the AI coach pipeline. Below that, stats like sub-100-millisecond render time and zero AI calls in the physics math.

I'll hit **Open Table** — that's the big green button — to get into the workspace.

---

## PART 3 — SIGN IN (about 20 seconds)

[Click Open Table]

Workspace needs an account because your stats follow you — shots analyzed, taken, potted, scratches, pot rate.

This is the **Players only** gate. I'll **Sign in** — or you can **Create account** on the other tab. Email, password, done.

[Sign in]

Top right you'll see my avatar circle with my initial. That opens my account menu later.

---

## PART 4 — WORKSPACE OVERVIEW (about 40 seconds)

[You're now in Workspace]

This is the main product. Let me walk through everything on screen.

**Top right:** green **Live** dot means we're connected to the backend through Socket.io — real-time updates. Next to it, an event counter — how many agent packets we've received this session.

**Below the nav — Stage Timeline:** little pills that light up as things run. With coach off, you just see **Physics**. With coach on, you see **researching → drafting → critiquing → done**. Below that, clickable chips for each agent event — PhysicsCore, Researcher, Draftsman, Critic. Click any chip to open the full **Coach analysis** modal.

**Left side — the table.** Green felt, six pockets, some gray ambient balls just for looks.

**Toolbar above the table — Presets:**
- **Straight-In** — easy line shot
- **45° Cut** — half-ball angle
- **Thin Cut** — steep cut
- **Bank-Angle-Demo** — rail geometry
- **New Shot** — clears everything and starts fresh

**On the right side of that toolbar:**
- **AI Coach** checkbox — turns the multi-agent coach on or off
- **Sound** button — pot sounds on or off, shows Muted when off
- **Read Aloud** button — appears next to Sound, reads the coach text out loud using your browser's voice. Shows "Reading" when it's on.

**Legend row below:** white dot is cue ball, orange is object ball, green dashed is ghost ball, and right-click on the table adds a **blocker ball** — up to five obstacles.

**Bottom left — Spin control:** drag on the cue ball face to add english. Shows you how spin changes the cue path after contact.

**Right panel — AI Coach:** shows verdict, cut angle, difficulty, and the coach narrative when it's ready.

---

## PART 5 — LIVE DEMO: STRAIGHT-IN (about 60 seconds)

[Make sure AI Coach is OFF first]

Let me run a shot. I'll click **Straight-In** preset.

[Click Straight-In — wait for lines]

Watch — cyan dashed line from cue to ghost ball. Amber line from object to pocket. Violet tangent line. That appeared in under a second.

Behind the scenes: the frontend sent the shot to our Node broker on port 3001. The broker checked the coordinates with Zod validation. Then our Python engine on port 8000 ran real trigonometry — ghost ball position, cut angle, difficulty. No ChatGPT. No guessing. Pure math.

The answer came back as vector data and drew on this SVG table.

You see a banner — **Makeable** or **Not makeable** — plus difficulty: Easy, Medium, or Hard. There's a **Take Shot** button. And a little **?** help circle — click that for **How This Works** — four physics rules explained in plain English.

[Click Take Shot — let animation play]

Cue stick hits, ball rolls, you hear the clack and plop if Sound is on. If it pots, green success. If you scratch, you get an error toast. My stats update automatically.

---

## PART 6 — AI COACH ON (about 45 seconds)

[Check the AI Coach checkbox ON]

Now same shot with coach enabled. **Straight-In** again.

[Click Straight-In — wait]

Same physics lines instantly — math always comes first. But now watch the timeline: **researching**, then **drafting**, then **critiquing**.

Three agents in a LangGraph pipeline:
1. **Researcher** — gathers shot facts
2. **Draftsman** — writes the explanation
3. **Critic** — checks the risk

Each step sends live telemetry to the backend. Click a timeline chip — you see the raw agent payload.

[Point at AI Coach panel on the right]

The coach panel fills in with markdown text — cut angle in degrees, difficulty tag, full narrative. If I hit **Read Aloud**, it speaks the coach text to me.

Important thing we built: the AI never calculates the angles. It only explains math the Python engine already solved. If OpenAI is down, we still have a fallback coach — physics always works.

---

## PART 7 — MANUAL AIM (quick, 20 seconds)

[Click New Shot]

I'll show manual aim too. **New Shot** clears the table.

[Click cue ball, object ball, pocket on table]

Step one — cue ball. Step two — object ball. Step three — pocket. You get a guide at the top. **Undo last point** if you mess up. Or press Escape on keyboard.

Shot computes automatically on the third click. Same pipeline.

---

## PART 8 — ACCOUNT MENU (15 seconds)

[Click avatar top right]

My account menu: four stat tiles — **Analyzed**, **Shots taken**, **Potted**, **Scratches**. Pot rate at the bottom. Links to **Profile** and **Settings**. **Sign out** at the bottom.

---

## PART 9 — CAMERA SETUP (about 35 seconds)

[Click Camera Setup in nav]

Camera Setup — for real-world tables.

[Click Open Camera or Gallery — upload a photo]

I upload a photo of a table. Then I tap three points: cue, object, pocket. There's also an **auto-detect** option that tries to find balls with OpenCV — still beta.

[Tap three points — wait for overlay]

Same physics engine runs. Vectors draw on top of my actual photo. So it's not just a fake green table — it's my bar table, my home table.

**Clear taps** resets markers. **Retake** lets me swap the photo. **AI Coach** toggle works the same here.

---

## PART 10 — WATCH (about 25 seconds)

[Click Watch in nav — note red dot]

Watch is for learning from real pool content. No sign-in needed.

Two tabs at the top: **YouTube channels** and **Twitch live**.

[YouTube tab — click a channel card on the right]

Left side — embedded video player. Right side — channel picker: Matchroom Pool, PoolActionTV, AZBilliards TV, Dr. Dave Billiards for physics, Maximum Break for training, Predator Cues. Click any card to switch.

[Twitch tab briefly]

Twitch tab — type a channel name and watch live billiards streams.

---

## PART 11 — TRAIN (about 35 seconds)

[Click Train in nav — graduation cap icon]

Training Hub. This is what replaces random Instagram drills.

Top section — **Aiming systems**: Ghost ball, Fractional aiming, Contact point. The theory behind what Axiom draws.

Middle — **Drills — click to load**. Six cards with Easy, Medium, Hard tags:
- Stop Shot Control
- **Corner-Pocket Straight-In** — I'll use this one
- Half-Ball Cut
- Side-Pocket Cut
- Thin Cut Challenge
- Bank Angle Reading

[Click Corner-Pocket Straight-In → Load on table]

**Load on table** — one click. It jumps to workspace with the exact ball positions already placed. No guessing from a video.

[Back in workspace — click to compute if needed]

Balls are set. Compute. Practice the same geometry every time.

Bottom — **Video lessons** from Dr. Dave and Maximum Break. **Open Watch** button links back to live channels.

---

## PART 12 — SETTINGS & PROFILE (about 30 seconds)

[Click avatar → Settings, or go to /settings]

**Settings** — my preferences stored locally:
- Default **AI Coach** on
- **Sound effects**
- **Read coach aloud**
- **Auto-open coach analysis**
- **Confirm before new shot**
- **Reduce motion**, **particles**, **compact nav**
- **Export JSON**, **clear history**, **reset settings**

[Go to Profile]

**Profile** — my name, email, join date. Lifetime stats grid. **This device — recent shots** — last 30 on this browser. Quick links back to workspace and drills.

---

## PART 13 — TECH STACK + CLOSE (about 40 seconds)

[Optional: flash Docs page or just speak over workspace]

Quick tech stack for anyone technical watching:

- **Frontend** — React, Vite, Tailwind. Port 3000. The table, coach panel, all the UI.
- **Backend** — Node.js, Express, Socket.io. Port 3001. Auth with JWT, validation with Zod, real-time events.
- **Engine** — Python, FastAPI, LangGraph. Port 8000. Physics core plus coach agents.

Flow: you click → Socket.io → broker validates → Python computes → vectors back → coach streams if enabled.

Three services. One rule: **AI explains. Math computes.**

I built this because I needed it this summer. If you've ever stood over a shot with no idea where to aim — that's who this is for.

I'm Dhruval. **Axiom** — see the shot, understand the shot, track the shot.

Thank you.

---

## BEFORE YOU RECORD — CHECKLIST

- [ ] Engine running: `uvicorn app:app --port 8000` in engine/
- [ ] Backend running: `npm start` in backend/
- [ ] Frontend running: `npm run dev` in frontend/
- [ ] Signed in already (saves time on camera)
- [ ] AI Coach tested once before recording
- [ ] Have a table photo ready for Camera section

**Total time if spoken naturally: about 6–8 minutes**
