import logging
import re
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import CORS_ORIGINS
from graph import compute_shot_fast, run_shot_analysis
from llm import is_llm_configured
from schemas import ComputeShotRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Axiom Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


def _load_table_bounds() -> tuple[float, float]:
    presets = Path(__file__).resolve().parents[1] / "frontend" / "src" / "config" / "billiardsPresets.js"
    if presets.is_file():
        m = re.search(r"TABLE = \{ w: (\d+(?:\.\d+)?), h: (\d+(?:\.\d+)?)", presets.read_text())
        if m:
            return float(m.group(1)), float(m.group(2))
    return 36.0, 18.0


TABLE_W, TABLE_H = _load_table_bounds()


def _assert_table_bounds(req: ComputeShotRequest) -> None:
    points = [req.cue_ball, req.object_ball, req.pocket, *req.obstacles]
    for pt in points:
        if pt.x < 0 or pt.x > TABLE_W or pt.y < 0 or pt.y > TABLE_H:
            raise HTTPException(
                status_code=400,
                detail=f"coordinates must be within 0-{TABLE_W} x 0-{TABLE_H}",
            )


class AnalyzeShotRequest(ComputeShotRequest):
    with_coach: bool = Field(default=True)


@app.get("/health")
async def health():
    return {"status": "ok", "llm_configured": is_llm_configured()}


@app.post("/api/compute_shot")
async def compute_shot(req: ComputeShotRequest):
    _assert_table_bounds(req)
    try:
        sol = compute_shot_fast(req)
        return sol.model_dump()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("compute_shot failed: %s", exc)
        raise HTTPException(status_code=500, detail="compute_shot failed") from exc


@app.post("/api/analyze_shot")
async def analyze_shot(req: AnalyzeShotRequest, background_tasks: BackgroundTasks):
    _assert_table_bounds(req)
    # No API key is not an error: every graph node degrades to deterministic
    # coach copy, so the coach always answers — the LLM only upgrades the text.
    if req.with_coach:
        background_tasks.add_task(run_shot_analysis, req)
        return {"status": "accepted", "message": "Shot analysis started"}
    sol = compute_shot_fast(req)
    return sol.model_dump()
