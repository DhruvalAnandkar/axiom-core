import logging
from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from coach_fallback import fallback_draft, fallback_research, fallback_verdict
from llm import invoke_llm
from physics.core import compute_shot_solution
from schemas import ComputeShotRequest, ShotSolution, Vector2D
from telemetry import emit_telemetry

logger = logging.getLogger(__name__)

PHYSICS_RULES = """Ground truth (do not re-derive):
1. Ghost ball: cue center must reach ghost point 2r behind object along pocket line.
2. 90° tangent rule: stun cue path is perpendicular to object departure.
3. Conservation of momentum splits paths at cut angle.
4. Natural roll deflects ~30° scaled by cut/90."""


class ShotState(TypedDict, total=False):
    cue_ball: dict
    object_ball: dict
    pocket: dict
    obstacles: list
    stage: str
    shot_solution: dict
    research: str
    draft_narrative: str
    critic_verdict: str
    coach_narrative: str
    status: str
    iteration_count: int


def _vec(d: dict) -> Vector2D:
    return Vector2D(**d)


async def researcher_node(state: ShotState) -> dict:
    # Ground truth is fixed by design — reciting it needs no LLM round-trip.
    # Keeping this node deterministic makes the pipeline respond instantly.
    await emit_telemetry(
        "researcher", "Researcher", "running", "Loading physics ground truth",
        {"stage": "researching"},
    )
    research = fallback_research()
    await emit_telemetry(
        "researcher", "Researcher", "completed", "Physics context ready",
        {"stage": "drafting", "research": research},
    )
    return {"research": research, "stage": "researching", "status": "completed"}


async def draftsman_node(state: ShotState) -> dict:
    if state.get("status") == "error":
        return {}
    try:
        await emit_telemetry(
            "draftsman", "Draftsman", "running", "Narrating shot from physics core",
            {"stage": "drafting"},
        )
        # Physics was computed up-front in run_shot_analysis; reuse it so the
        # only cost here is the narration call.
        sol_dict = state.get("shot_solution")
        if not sol_dict:
            solution = compute_shot_solution(
                _vec(state["cue_ball"]),
                _vec(state["object_ball"]),
                _vec(state["pocket"]),
                [_vec(o) for o in state.get("obstacles", [])],
            )
            sol_dict = solution.model_dump()
            await emit_telemetry(
                "draftsman", "Draftsman", "completed", "Shot vectors computed",
                {
                    "stage": "drafting",
                    "vector_data": sol_dict.get("vector_data", []),
                    "shot_solution": sol_dict,
                },
            )
        # Compact prompt: vector coordinates add hundreds of input tokens the
        # narrator must not use anyway (no freehand math).
        compact = {
            k: sol_dict.get(k)
            for k in (
                "is_makeable",
                "unmakeable_reason",
                "cut_angle_deg",
                "tangent_angle_deg",
                "ghost_ball",
            )
        }
        try:
            draft = await invoke_llm(
                "Draftsman coach. Use ONLY the tool output numbers. No freehand math. "
                "Reply in markdown, under 80 words, punchy and confident. No emoji.",
                f"ShotSolution:\n{compact}\n\nNarrate the shot step-by-step (ghost ball aim, cut, tangent).",
            )
        except Exception as exc:
            logger.warning("draftsman_node LLM unavailable, using fallback: %s", exc)
            draft = fallback_draft(sol_dict)
        await emit_telemetry(
            "draftsman",
            "Draftsman",
            "completed",
            "Coach draft ready",
            {
                "stage": "critiquing",
                "draft_narrative": draft,
                "coach_narrative": draft,
                "vector_data": sol_dict.get("vector_data", []),
                "shot_solution": sol_dict,
            },
        )
        return {
            "shot_solution": sol_dict,
            "draft_narrative": draft,
            "stage": "drafting",
            "status": "drafted",
            "iteration_count": state.get("iteration_count", 0) + 1,
        }
    except Exception as exc:
        logger.exception("draftsman_node: %s", exc)
        await emit_telemetry("draftsman", "Draftsman", "error", str(exc), {"stage": "drafting"})
        return {"status": "error", "stage": "drafting"}


async def critic_node(state: ShotState) -> dict:
    if state.get("status") == "error":
        return {}
    sol = state.get("shot_solution", {})
    try:
        await emit_telemetry(
            "critic", "Critic", "running", "Risk assessment",
            {"stage": "critiquing", "is_makeable": sol.get("is_makeable"), "cut_angle_deg": sol.get("cut_angle_deg")},
        )
        try:
            verdict = await invoke_llm(
                "Critic coach. Do not re-derive geometry. Assess risk from is_makeable and "
                "cut_angle_deg only. Reply in markdown, under 40 words, one risk line + one tip. No emoji.",
                f"is_makeable={sol.get('is_makeable')} cut_angle_deg={sol.get('cut_angle_deg')}",
            )
        except Exception as exc:
            logger.warning("critic_node LLM unavailable, using fallback: %s", exc)
            verdict = fallback_verdict(sol)
            coach = f"{state.get('draft_narrative', '')}\n\n---\n\n{verdict}"
            await emit_telemetry(
                "critic",
                "Critic",
                "approved",
                verdict[:200],
                {
                    "stage": "done",
                    "coach_narrative": coach,
                    "vector_data": sol.get("vector_data", []),
                    "shot_solution": sol,
                },
            )
            return {
                "critic_verdict": verdict,
                "coach_narrative": coach,
                "stage": "done",
                "status": "approved",
                "iteration_count": 2,
            }
        coach = f"{state.get('draft_narrative', '')}\n\n---\n\n{verdict}"
        await emit_telemetry(
            "critic",
            "Critic",
            "approved",
            verdict[:200],
            {
                "stage": "done",
                "coach_narrative": coach,
                "vector_data": sol.get("vector_data", []),
                "shot_solution": sol,
            },
        )
        return {
            "critic_verdict": verdict,
            "coach_narrative": coach,
            "stage": "done",
            "status": "approved",
            "iteration_count": 2,
        }
    except Exception as exc:
        logger.exception("critic_node: %s", exc)
        verdict = fallback_verdict(sol)
        coach = f"{state.get('draft_narrative', '')}\n\n---\n\n{verdict}"
        await emit_telemetry(
            "critic",
            "Critic",
            "approved",
            "Coach fallback",
            {
                "stage": "done",
                "coach_narrative": coach,
                "vector_data": sol.get("vector_data", []),
                "shot_solution": sol,
            },
        )
        return {
            "critic_verdict": verdict,
            "coach_narrative": coach,
            "stage": "done",
            "status": "approved",
            "iteration_count": 2,
        }


def route_after_critic(state: ShotState) -> Literal["draftsman", "complete"]:
    if state.get("status") == "error":
        return "complete"
    if state.get("iteration_count", 0) < 2:
        return "draftsman"
    return "complete"


def build_graph():
    g = StateGraph(ShotState)
    g.add_node("researcher", researcher_node)
    g.add_node("draftsman", draftsman_node)
    g.add_node("critic", critic_node)
    g.add_edge(START, "researcher")
    g.add_edge("researcher", "draftsman")
    g.add_edge("draftsman", "critic")
    g.add_conditional_edges("critic", route_after_critic, {"draftsman": "draftsman", "complete": END})
    return g.compile()


shot_graph = build_graph()


async def run_shot_analysis(req: ComputeShotRequest) -> None:
    initial: ShotState = {
        "cue_ball": req.cue_ball.model_dump(),
        "object_ball": req.object_ball.model_dump(),
        "pocket": req.pocket.model_dump(),
        "obstacles": [o.model_dump() for o in req.obstacles],
        "stage": "researching",
        "status": "pending",
        "iteration_count": 0,
    }
    try:
        # Physics first: the table overlay and a deterministic coach draft land
        # on the client immediately; LLM narration then refines the draft.
        solution = compute_shot_solution(
            req.cue_ball, req.object_ball, req.pocket, req.obstacles
        )
        sol_dict = solution.model_dump()
        initial["shot_solution"] = sol_dict
        await emit_telemetry(
            "physics",
            "PhysicsCore",
            "completed",
            "Shot vectors computed",
            {
                "stage": "researching",
                "vector_data": sol_dict.get("vector_data", []),
                "shot_solution": sol_dict,
                "coach_narrative": fallback_draft(sol_dict, footer=False),
            },
        )
    except Exception as exc:
        logger.exception("run_shot_analysis physics failed: %s", exc)
        await emit_telemetry(
            "draftsman", "Draftsman", "error", str(exc), {"stage": "drafting"}
        )
        return
    try:
        await shot_graph.ainvoke(initial)
    except Exception as exc:
        logger.exception("run_shot_analysis failed: %s", exc)


def compute_shot_fast(req: ComputeShotRequest) -> ShotSolution:
    return compute_shot_solution(
        req.cue_ball,
        req.object_ball,
        req.pocket,
        req.obstacles,
    )
