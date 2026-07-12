from pydantic import BaseModel, Field


class Vector2D(BaseModel):
    x: float
    y: float


class BallVector(BaseModel):
    ball_id: str
    start: Vector2D
    end: Vector2D
    color: str


class ShotSolution(BaseModel):
    cue_ball: Vector2D
    object_ball: Vector2D
    pocket: Vector2D
    ghost_ball: Vector2D
    tangent_angle_deg: float
    cut_angle_deg: float
    is_makeable: bool
    unmakeable_reason: str | None = None
    vector_data: list[BallVector]
    coach_narrative: str | None = None


class ComputeShotRequest(BaseModel):
    cue_ball: Vector2D
    object_ball: Vector2D
    pocket: Vector2D
    obstacles: list[Vector2D] = Field(default_factory=list)
