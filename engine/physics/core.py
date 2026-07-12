import math

from schemas import BallVector, ShotSolution, Vector2D

BALL_RADIUS = 1.125
# Beyond ~90° the object ball's own geometry blocks any legal contact.
CUT_ANGLE_LIMIT_DEG = 89.5
CUT_LIMIT_REASON = "cut angle exceeds the physical limit for a legal shot"


def ghost_ball_position(object_ball: Vector2D, pocket: Vector2D, r: float = BALL_RADIUS) -> Vector2D:
    dx = object_ball.x - pocket.x
    dy = object_ball.y - pocket.y
    dist = math.hypot(dx, dy)
    if dist == 0:
        raise ValueError("degenerate shot: points coincide")
    ux, uy = dx / dist, dy / dist
    return Vector2D(x=object_ball.x + ux * 2 * r, y=object_ball.y + uy * 2 * r)


def object_ball_direction(object_ball: Vector2D, pocket: Vector2D) -> Vector2D:
    dx = pocket.x - object_ball.x
    dy = pocket.y - object_ball.y
    dist = math.hypot(dx, dy)
    if dist == 0:
        raise ValueError("degenerate shot: points coincide")
    return Vector2D(x=dx / dist, y=dy / dist)


def tangent_line_direction(obj_dir: Vector2D) -> Vector2D:
    return Vector2D(x=-obj_dir.y, y=obj_dir.x)


def cut_angle_degrees(cue_ball: Vector2D, ghost_ball: Vector2D, obj_dir: Vector2D) -> float:
    aim_dx = ghost_ball.x - cue_ball.x
    aim_dy = ghost_ball.y - cue_ball.y
    aim_len = math.hypot(aim_dx, aim_dy)
    if aim_len == 0:
        return 0.0
    dot = (aim_dx / aim_len) * obj_dir.x + (aim_dy / aim_len) * obj_dir.y
    return math.degrees(math.acos(max(-1.0, min(1.0, dot))))


def rolling_deflection_30(cut_angle: float) -> float:
    return 30.0 * min(cut_angle / 90.0, 1.0)


def _point_segment_distance(px: float, py: float, x1: float, y1: float, x2: float, y2: float) -> float:
    dx, dy = x2 - x1, y2 - y1
    len_sq = dx * dx + dy * dy
    if len_sq == 0:
        return math.hypot(px - x1, py - y1)
    t = max(0.0, min(1.0, ((px - x1) * dx + (py - y1) * dy) / len_sq))
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy
    return math.hypot(px - proj_x, py - proj_y)


def is_shot_makeable(
    cue_ball: Vector2D,
    ghost_ball: Vector2D,
    obstacles: list[Vector2D],
    r: float = BALL_RADIUS,
) -> bool:
    threshold = 2 * r
    for obs in obstacles:
        if _point_segment_distance(obs.x, obs.y, cue_ball.x, cue_ball.y, ghost_ball.x, ghost_ball.y) < threshold:
            return False
    return True


def build_vector_data(
    cue_ball: Vector2D,
    object_ball: Vector2D,
    pocket: Vector2D,
    ghost_ball: Vector2D,
    obj_dir: Vector2D,
    tan_dir: Vector2D,
) -> list[BallVector]:
    tan_end = Vector2D(
        x=object_ball.x + tan_dir.x * 4,
        y=object_ball.y + tan_dir.y * 4,
    )
    return [
        BallVector(ball_id="cue", start=cue_ball, end=ghost_ball, color="#ffffff"),
        BallVector(ball_id="object", start=object_ball, end=pocket, color="#f59e0b"),
        BallVector(ball_id="ghost", start=ghost_ball, end=ghost_ball, color="#00ff6688"),
        BallVector(ball_id="aim", start=cue_ball, end=ghost_ball, color="#00ff66"),
        BallVector(ball_id="tangent", start=object_ball, end=tan_end, color="#6ee7b7"),
    ]


def compute_shot_solution(
    cue_ball: Vector2D,
    object_ball: Vector2D,
    pocket: Vector2D,
    obstacles: list[Vector2D] | None = None,
    r: float = BALL_RADIUS,
) -> ShotSolution:
    obstacles = obstacles or []
    ghost = ghost_ball_position(object_ball, pocket, r)
    obj_dir = object_ball_direction(object_ball, pocket)
    tan_dir = tangent_line_direction(obj_dir)
    cut = cut_angle_degrees(cue_ball, ghost, obj_dir)
    tan_angle = rolling_deflection_30(cut)
    makeable = is_shot_makeable(cue_ball, ghost, obstacles, r)
    reason = None
    if cut >= CUT_ANGLE_LIMIT_DEG:
        makeable = False
        reason = CUT_LIMIT_REASON
    vectors = build_vector_data(cue_ball, object_ball, pocket, ghost, obj_dir, tan_dir)
    return ShotSolution(
        cue_ball=cue_ball,
        object_ball=object_ball,
        pocket=pocket,
        ghost_ball=ghost,
        tangent_angle_deg=tan_angle,
        cut_angle_deg=cut,
        is_makeable=makeable,
        unmakeable_reason=reason,
        vector_data=vectors,
    )
