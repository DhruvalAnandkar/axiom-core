"""Deterministic coach copy when OpenAI is unavailable (quota, network, etc.)."""


def fallback_research() -> str:
    return (
        "### Physics principles\n\n"
        "1. **Ghost ball** — Aim the cue through the ghost point, one ball diameter behind "
        "the object on the pocket line.\n"
        "2. **90° tangent** — On a stun hit, the cue leaves perpendicular to the object path.\n"
        "3. **Momentum split** — Cut angle divides energy between cue and object.\n"
        "4. **Rolling deflection** — Natural roll bends the cue up to ~30° (scaled by cut ÷ 90°).\n\n"
        "_Deterministic coach mode — physics numbers are exact._"
    )


def fallback_draft(sol: dict, footer: bool = True) -> str:
    cut = float(sol.get("cut_angle_deg") or 0)
    makeable = bool(sol.get("is_makeable"))
    ghost = sol.get("ghost_ball") or {}
    gx, gy = ghost.get("x"), ghost.get("y")
    ghost_txt = f"({gx:g}, {gy:g})" if gx is not None and gy is not None else "the ghost ball"
    verdict = "**Makeable**" if makeable else "**Not makeable**"
    body = (
        f"### Shot breakdown\n\n"
        f"{verdict} — **{cut:.1f}° cut**.\n\n"
        f"- Place cue to strike through the ghost ball at **{ghost_txt}**.\n"
        f"- Object line runs toward the selected pocket.\n"
        f"- Tangent line shows the stun departure direction after contact.\n\n"
        f"_Numbers from the physics core only — no freehand math._"
    )
    if footer:
        body += "\n\n_Deterministic coach mode — physics numbers are exact._"
    return body


def fallback_verdict(sol: dict) -> str:
    cut = float(sol.get("cut_angle_deg") or 0)
    makeable = bool(sol.get("is_makeable"))
    if makeable and cut < 30:
        risk = "Low risk — straightforward aim through the ghost ball."
    elif makeable and cut < 60:
        risk = "Medium risk — moderate cut; stroke must be crisp."
    elif makeable:
        risk = "Higher risk — steep cut; position and speed matter."
    else:
        risk = "Not recommended — blocked path or extreme geometry."
    return (
        f"### Coach verdict\n\n{risk}\n\n"
        f"_Deterministic coach mode — physics numbers are exact._"
    )
