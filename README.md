# Axiom: Precision Athletics

Deterministic billiards physics + multi-agent LangGraph coaching. Numbers come from Python trig; LLMs narrate and assess risk only.

## Quick start (< 2 min)

```bash
# 1. Copy env and add your OpenAI key (only needed for AI Coach mode)
cp .env.example .env   # or create .env with OPENAI_API_KEY=sk-...

# 2. Docker (recommended)
docker compose up --build

# 3. Open http://localhost:3000
```

**Local dev (no Docker):**

```bash
# Terminal 1 — broker
cd backend && npm install && npm run dev

# Terminal 2 — physics engine
cd engine && python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# Terminal 3 — frontend
cd frontend && npm install && npm run dev
```

Set `ENGINE_URL=http://localhost:8000` in `backend/.env` for local dev.

## Usage

1. **Presets** — instant physics-only shots (<200ms, no LLM).
2. **Click-to-aim** — cue ball → object ball → pocket on the table.
3. **AI Coach** — toggle on for full LangGraph pipeline (research → draft → critic).
4. Vectors render immediately after physics; coach narrative streams later.
5. Click timeline events to open the glassmorphic coach modal.

## Architecture

| Service   | Port | Role                                      |
|-----------|------|-------------------------------------------|
| frontend  | 3000 | Billiards canvas, Socket.io client        |
| backend   | 3001 | Event broker, Zod validation, webhook     |
| engine    | 8000 | FastAPI + physics core + LangGraph agents |

```
Frontend --compute_shot--> Backend --POST--> Engine (physics / analyze)
Engine --webhook--> Backend --agent_state_update--> Frontend
```

## Physics tests

```bash
cd engine && .\venv\Scripts\python -m unittest physics.test_core -v
```

## Out of scope

Spin/english, bank-shot mechanics, auth, persistence beyond in-memory telemetry.
