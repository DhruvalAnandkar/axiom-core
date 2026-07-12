# Axiom: Precision Athletics

Deterministic billiards physics + multi-agent LangGraph coaching. Numbers come from Python trig; LLMs narrate and assess risk only.

**Repository:** [github.com/DhruvalAnandkar/axiom-core](https://github.com/DhruvalAnandkar/axiom-core)

## What it does

Axiom is a billiards training platform that separates **physics** from **coaching**:

- **Physics** — ghost ball, cut angle, tangent lines, and aim vectors computed deterministically in Python (<200ms).
- **AI Coach** — optional LangGraph pipeline (Researcher → Draftsman → Critic) that narrates the shot and flags risk. Falls back to a deterministic coach if the LLM is unavailable.

## Features

| Area | Details |
|------|---------|
| **Workspace** | Interactive table, shot presets, click-to-aim (cue → object → pocket), spin control, Take Shot animation, stage timeline, coach panel |
| **AI Coach** | Toggle on/off; vectors render immediately, narrative streams after physics |
| **Camera Setup** | Photo/camera aiming with OpenCV.js ball auto-detect (beta) |
| **Train** | Guided drills with deep links back to the table |
| **Watch** | Curated billiards technique videos |
| **Auth** | Register/login with JWT; shot stats tracked per user |
| **User hub** | Profile, Settings, Help, Keyboard Shortcuts |
| **PWA** | Installable app shell with offline service worker |
| **Read Aloud** | Web Speech API narration of coach output |

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7, Framer Motion, Socket.io Client, Lucide icons |
| **Backend** | Node.js 20, Express 5, Socket.io 4, Zod, Helmet, CORS, express-rate-limit, JWT + bcrypt |
| **Engine** | Python 3.11, FastAPI, Uvicorn, LangGraph, LangChain OpenAI, Pydantic, httpx |
| **Data** | MongoDB (optional) with local JSON file fallback |
| **Deploy** | Docker Compose (3 services) |

## Architecture

| Service | Port | Role |
|---------|------|------|
| `frontend` | 3000 | Billiards canvas, routing, Socket.io client, PWA |
| `backend` | 3001 | API gateway, auth, Zod validation, webhook relay |
| `engine` | 8000 | FastAPI + physics core + LangGraph agents |

```
Frontend --compute_shot--> Backend --POST--> Engine (physics / analyze)
Engine --webhook (httpx)--> Backend --agent_state_update--> Frontend
```

**Design rule:** LLMs never compute physics. All geometry and angles come from `engine/physics/core.py`.

## Quick start

### Docker (recommended)

```bash
# 1. Root env — OpenAI key only needed for AI Coach mode
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...

# 2. Backend env — copy and adjust if needed
cp backend/.env.example backend/.env

# 3. Build and run all three services
docker compose up --build

# 4. Open http://localhost:3000
```

### Local dev (no Docker)

All three services must be running for the workspace to work.

```bash
# Terminal 1 — broker
cd backend
npm install
cp .env.example .env   # set ENGINE_URL=http://127.0.0.1:8000 on Windows
npm run dev

# Terminal 2 — physics engine
cd engine
python -m venv venv
.\venv\Scripts\activate        # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# Terminal 3 — frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** (or the port Vite prints).

> **Windows note:** Use `ENGINE_URL=http://127.0.0.1:8000` in `backend/.env`. `localhost` can fail to resolve to the engine on some setups.

## Environment variables

### Root `.env` (engine + Docker)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Required for AI Coach mode |
| `OPENAI_MODEL` | Default: `gpt-4o-mini` |
| `OPENAI_TIMEOUT` | LLM timeout in seconds |
| `OPENAI_MAX_RETRIES` | Retry count on API failure |

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default `3001`) |
| `FRONTEND_URL` | CORS origin (default `http://localhost:3000`) |
| `ENGINE_URL` | Engine base URL (default `http://127.0.0.1:8000`) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `MONGODB_URI` | Optional — omit to use local `backend/data/users.json` |
| `MONGODB_DB` | Database name (default `axiom`) |

## Usage

1. **Sign up / log in** — workspace and camera routes require auth.
2. **Presets** — Straight-In, 45° Cut, Thin Cut, Bank-Angle-Demo for instant physics-only shots.
3. **Click-to-aim** — cue ball → object ball → pocket on the table.
4. **AI Coach** — toggle on for the full LangGraph pipeline; toggle off for physics-only.
5. **Take Shot** — animate the cue stick; hear collision/sink sounds.
6. **Timeline** — click stage events to open the coach modal.
7. **Camera Setup** — upload or capture a table photo for overlay aiming.
8. **Profile** — view shot stats (analyzed, taken, potted, scratches, pot rate).

## Tests

```bash
cd engine
.\venv\Scripts\python -m unittest physics.test_core -v
```

## Project structure

```
axiom-core/
├── frontend/     React + Vite UI
├── backend/      Express + Socket.io broker + auth
├── engine/       FastAPI + physics + LangGraph
├── docker-compose.yml
└── .env.example
```

## Known limitations

- Spin/english and bank-shot mechanics are visual hints only — not full physics simulation.
- OpenCV auto-detect is beta; manual tap placement is always available.
- AI Coach requires a valid OpenAI API key with available quota.

## License

ISC
