# Axiom — 3-Minute Live Pitch Script (Dhruval)

**Total: 3:00** · Speak at a calm pace · [Brackets] = click or show on screen

---

## 1. HOOK & PROBLEM — 30 seconds

Hi, I'm Dhruval.

This summer I started learning pool. I'd miss a shot, open Instagram, and get ten different tips — none about the shot in front of me. Pool fails most learners for one reason: **aiming is invisible**. Pros see geometry. I saw two balls and a pocket and hope. Social media gives vibes, not a feedback loop.

---

## 2. THE SOLUTION — 45 seconds

So I built **Axiom** — a precision training app where you aim a real shot and the geometry appears before you shoot.

Three clicks: cue ball, object ball, pocket. A **Python physics engine** computes ghost ball, cut angle, and tangent lines in under 100 milliseconds. Toggle **AI Coach** and three **LangGraph agents** explain the shot in plain English.

**Tech stack in one breath:** React frontend on port 3000, Node and Socket.io broker on 3001, FastAPI engine on 8000. Every payload validated — Zod on the broker, Pydantic on the engine. **Hard rule: AI narrates. Python does the math.**

Your account tracks pots, misses, and pot rate — so improvement is real, not a feeling.

[Click **Open Table** on landing page → **Sign in**]

---

## 3. LIVE DEMO — 60 seconds

[Workspace loaded — point at UI quickly as you speak]

**Workspace** — the core. Top right: green **Live** means Socket.io is connected. Presets: **Straight-In**, **45° Cut**, **Thin Cut**, **Bank-Angle-Demo**. **New Shot** resets. **AI Coach** checkbox. **Sound** and **Read Aloud** buttons.

[Click **Straight-In** — pause half a second while vectors draw]

Watch — cyan cue-to-ghost, amber object-to-pocket. That hit our Python core through the broker. Zero AI in the math.

[Check **AI Coach** ON → click **Straight-In** again — point at timeline]

Timeline lights up: researching, drafting, critiquing. Coach panel fills in on the right.

[Click **Take Shot** — let animation finish]

Potted. Stats bump on my account automatically.

[Click avatar — flash stats — optional 5 sec only if time]

Analyzed, taken, potted, scratches, pot rate.

[If 10 seconds left: click **Train** in nav → **Corner-Pocket Straight-In** → **Load on table** — balls appear on workspace]

One click — drill loads exact positions. No rewinding a video.

---

## 4. IMPACT & FUTURE — 45 seconds

Axiom replaces random reels with **structured practice**. **Camera Setup** overlays geometry on a real table photo. **Watch** curates pro and physics channels. **Train** deep-links six drills onto the table. **Settings** and **Profile** make it a real product, not a demo.

This pattern scales beyond pool — any sport with invisible geometry: golf aim, passing angles, shooting lanes. Deterministic core for trust. AI layer for explanation. Real-time broker for live feedback.

I built what I needed this summer. If you've ever stood over a shot with no plan — this is for you.

I'm Dhruval. **Axiom** — see the shot, understand the shot, track the shot. Thank you.

---

## TIMING CHEAT SHEET

| Section | Target | Words (~) |
|---------|--------|-----------|
| Hook & Problem | 0:00–0:30 | ~75 |
| Solution | 0:30–1:15 | ~115 |
| Live Demo | 1:15–2:15 | ~100 + actions |
| Impact & Future | 2:15–3:00 | ~115 |

---

## DEMO CLICK ORDER (print this separately)

1. Landing → **Open Table**
2. **Sign in**
3. **Straight-In** (coach OFF) — show vectors
4. **AI Coach** ON → **Straight-In** again — show timeline + panel
5. **Take Shot**
6. Avatar → stats (quick)
7. *(Optional if fast)* **Train** → **Corner-Pocket Straight-In** → **Load on table**

---

## TECH STACK — SAY THESE LINES WHEN YOU HIT TECH

| When you... | Say this |
|-------------|----------|
| Show vectors appear | "Python physics on port 8000 — real trig, not ChatGPT" |
| Toggle AI Coach | "LangGraph pipeline — Researcher, Draftsman, Critic over Socket.io" |
| Show Live badge | "Node broker on 3001 — real-time events" |
| Mention sign-in | "JWT auth, stats sync to your account" |
| Close | "React UI, Node broker, Python engine — three services, one rule" |

---

## BEFORE RECORDING

- Engine `:8000` · Backend `:3001` · Frontend `:3000` — all running
- Already signed in
- Practice the 60-second demo block twice — timing is tight
