# Axiom — AI Video Production Script

Use this for voiceover + screen recording. Warmer tone. Technical where it counts.
Pair with: screen capture of the real app (not stock pool footage).

---

## SCENE 1 — HOOK (0:00–0:25) | Face cam OR landing page

**Say:**
> Hi, I'm Dhruval. This summer I picked up pool — and immediately hit the same wall everyone hits. I'd miss a shot, pull out my phone, and get ten different answers. Hit it like this. Buy this cue. Try this drill. None of it was *my* shot. None of it told me where to actually aim. I wasn't getting better. I was just scrolling.

**On screen:** Landing page hero. Slow scroll. Pause on "Before you take it."

---

## SCENE 2 — THE PROBLEM (0:25–0:45)

**Say:**
> Here's the thing nobody talks about: aiming is invisible. Pros see geometry — ghost ball, cut angle, where the cue ball goes next. I saw two balls and a pocket and hope. Social media gives you vibes. I wanted training.

**On screen:** Quick cut to workspace empty table OR simple diagram overlay.

---

## SCENE 3 — THE PRODUCT (0:45–1:05)

**Say:**
> So I built Axiom. You click cue ball, object ball, pocket — three clicks. Deterministic Python physics draws the aim lines in under a hundred milliseconds. Toggle the AI coach, and three LangGraph agents explain the shot in plain English. Your account tracks every pot, every miss, every scratch. You can finally see if you're improving.

**On screen:** Sign in quickly → workspace loads.

---

## SCENE 4 — WORKSPACE DEMO (1:05–2:00) ⭐ MAIN BEAT

**Say:**
> This is the workspace. Watch — I hit Straight-In preset.
> *[pause while vectors appear]*
> Cyan line: cue to ghost ball. Amber: object to pocket. Violet: tangent. That's real trigonometry — zero LLM calls in the physics core.
> Now I turn on AI Coach and run it again.
> *[pause for timeline]*
> Researcher, Draftsman, Critic — each agent streams live over Socket.io. The math stays pure. The language layer helps you understand it.
> I'll take the shot.
> *[Take Shot animation]*
> Potted. Stats update on my profile automatically.

**On screen (match your words exactly):**
1. Click Straight-In (coach OFF)
2. Wait for vectors
3. Toggle AI Coach ON → Straight-In again
4. Point at timeline stages
5. Click Take Shot
6. Flash avatar menu stats

---

## SCENE 5 — CAMERA (2:00–2:25)

**Say:**
> Camera Setup is for real life. I upload a photo of a table, tap three points, and Axiom overlays the same geometry on *my* layout. Bar table, home table — your photo, our physics.

**On screen:** Upload image → tap 3 points → vectors appear on photo.

---

## SCENE 6 — TRAIN (2:25–2:50)

**Say:**
> Train is where Instagram fails you. Pick Corner-Pocket Straight-In — one click loads the exact ball positions on the table. No rewinding a video guessing where they put the balls. Click, compute, practice.

**On screen:** /learn → Corner-Pocket Straight-In → Load on table → compute.

---

## SCENE 7 — WATCH + PROFILE (2:50–3:10)

**Say:**
> Watch curates real channels — Matchroom, Dr. Dave's physics breakdowns. Profile shows my pot rate, shots taken, scratches. Improvement you can measure, not just feel.

**On screen:** Quick Watch channel switch → Profile stats page.

---

## SCENE 8 — TECH STACK (3:10–3:40)

**Say:**
> Under the hood: React frontend on three thousand, Node and Socket.io broker on three thousand one, FastAPI and LangGraph on eight thousand. Zod validates every payload. Pydantic on the engine. We drew one hard line — LLMs narrate. They never do the math. Physics works even if OpenAI is down.

**On screen:** Docs page OR quick terminal flash showing 3 services running OR architecture from landing stats.

---

## SCENE 9 — CLOSE (3:40–4:00)

**Say:**
> I built Axiom because I needed it this summer. See the shot. Understand the shot. Track the shot. I'm Dhruval — thanks for watching.

**On screen:** Workspace with vectors live OR landing CTA. Fade to Axiom logo.

---

# AI VIDEO TOOL SETUP

## Best approach (recommended)
1. **Record your screen** following scenes above (OBS or Windows Game Bar)
2. **Generate voice** in ElevenLabs / HeyGen / CapCut AI Voice — paste each SCENE block separately for natural pacing
3. **Sync** in CapCut or DaVinci — cut video to match pauses after "Watch—" and "Now I turn on"

## Do NOT
- Use generic stock pool footage instead of your app
- Read the dense 6650-char form script — it sounds robotic
- Rush the Straight-In vector moment — that's your proof

## Voice settings (AI tools)
- Pace: medium-slow
- Tone: confident, conversational (not news anchor)
- Add 0.5s pause after vector render
- Add 1s pause when coach timeline appears

## Music
- Low ambient synth under voice (-20dB)
- Mute during Scene 4 demo clicks so UI sounds (clack/plop) can land

---

# ONE-PARAGRAPH VERSION (for HeyGen single take)

Hi, I'm Dhruval. This summer I started learning pool and got tired of Instagram tips that never matched my shots. Aiming is invisible until someone shows you the geometry — ghost ball, cut angle, tangent line. I built Axiom to fix that. Three clicks on the table, Python physics renders aim lines in milliseconds, and an optional AI coach explains why the shot works. I demo Straight-In — vectors appear instantly — then enable the LangGraph coach pipeline and take the shot. Camera overlays geometry on a real table photo. Train loads drills directly onto the table with one click. Your stats track pots, misses, and pot rate. Three services: React, Node Socket.io, FastAPI LangGraph. LLMs narrate — they never do the math. I built the training system I needed. Axiom — see the shot, understand the shot, track the shot.
