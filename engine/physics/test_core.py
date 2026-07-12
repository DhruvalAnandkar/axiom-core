import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from physics.core import (
    BALL_RADIUS,
    compute_shot_solution,
    cut_angle_degrees,
    ghost_ball_position,
    is_shot_makeable,
    object_ball_direction,
)
from schemas import Vector2D


class TestPhysicsCore(unittest.TestCase):
    def test_straight_shot_zero_cut(self):
        cue = Vector2D(x=0, y=0)
        obj = Vector2D(x=10, y=0)
        pocket = Vector2D(x=20, y=0)
        sol = compute_shot_solution(cue, obj, pocket)
        self.assertAlmostEqual(sol.cut_angle_deg, 0.0, places=1)
        self.assertTrue(sol.is_makeable)

    def test_45_degree_cut(self):
        cue = Vector2D(x=4.0, y=1.5)
        obj = Vector2D(x=10, y=5)
        pocket = Vector2D(x=20, y=5)
        sol = compute_shot_solution(cue, obj, pocket)
        self.assertGreater(sol.cut_angle_deg, 35.0)
        self.assertLess(sol.cut_angle_deg, 55.0)

    def test_near_90_edge_case(self):
        cue = Vector2D(x=0, y=0)
        obj = Vector2D(x=10, y=0)
        pocket = Vector2D(x=10, y=-0.5)
        obj_dir = object_ball_direction(obj, pocket)
        ghost = ghost_ball_position(obj, pocket)
        cut = cut_angle_degrees(cue, ghost, obj_dir)
        self.assertGreater(cut, 80.0)

    def test_unmakeable_obstructed(self):
        cue = Vector2D(x=0, y=0)
        obj = Vector2D(x=10, y=0)
        pocket = Vector2D(x=20, y=0)
        ghost = ghost_ball_position(obj, pocket)
        blocker = Vector2D(x=(cue.x + ghost.x) / 2, y=(cue.y + ghost.y) / 2)
        self.assertFalse(is_shot_makeable(cue, ghost, [blocker]))

    def test_degenerate_coincident_points(self):
        pt = Vector2D(x=10, y=5)
        with self.assertRaises(ValueError) as ctx:
            ghost_ball_position(pt, pt)
        self.assertIn("degenerate shot", str(ctx.exception))
        with self.assertRaises(ValueError):
            object_ball_direction(pt, pt)

    def test_cut_angle_over_limit_is_unmakeable(self):
        # Cue ahead of the object ball relative to the pocket: approach angle > 90°.
        cue = Vector2D(x=14, y=0.5)
        obj = Vector2D(x=10, y=0)
        pocket = Vector2D(x=20, y=0)
        sol = compute_shot_solution(cue, obj, pocket)
        self.assertGreater(sol.cut_angle_deg, 90.0)
        self.assertFalse(sol.is_makeable)
        self.assertIn("physical limit", sol.unmakeable_reason)

    def test_ghost_ball_distance_sanity(self):
        obj = Vector2D(x=5, y=5)
        pocket = Vector2D(x=15, y=5)
        ghost = ghost_ball_position(obj, pocket)
        dist = math.hypot(ghost.x - obj.x, ghost.y - obj.y)
        self.assertAlmostEqual(dist, 2 * BALL_RADIUS, places=4)


if __name__ == "__main__":
    unittest.main()
