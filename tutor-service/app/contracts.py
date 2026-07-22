from __future__ import annotations

from typing import Any

from .catalog import LESSON_CATALOG

VALID_ACTIONS = {"highlight_criterion", "clear_highlight", "pulse_tutor"}
VALID_STATUSES = {"idle", "dirty", "evaluating", "success", "failure"}


class TutorRenderCommand:
    def __init__(self, action: str, criterion_id: str | None = None) -> None:
        if action not in VALID_ACTIONS:
            raise ValueError("unsupported tutor render action")
        if action == "highlight_criterion" and not criterion_id:
            raise ValueError("highlight_criterion requires criterion_id")
        if action != "highlight_criterion" and criterion_id is not None:
            raise ValueError("only highlight_criterion accepts criterion_id")
        self.action = action
        self.criterion_id = criterion_id

    def as_dict(self) -> dict[str, str]:
        command = {"layer": "lesson_tutor", "action": self.action}
        if self.criterion_id:
            command["criterion_id"] = self.criterion_id
        return command


def validate_context(value: Any) -> dict[str, Any]:
    """Accept learner state only; derive all lesson language and tool IDs from the allowlisted catalog."""
    if not isinstance(value, dict):
        raise ValueError("context must be an object")
    lesson_id = value.get("lesson_id")
    screen_id = value.get("screen_id")
    status = value.get("status")
    if not isinstance(lesson_id, str) or not isinstance(screen_id, str):
        raise ValueError("lesson_id and screen_id are required strings")
    if status not in VALID_STATUSES:
        raise ValueError("invalid lesson status")

    screen = LESSON_CATALOG.get(lesson_id, {}).get(screen_id)
    if not screen:
        raise ValueError("lesson screen is not tutor-enabled")
    criteria = screen["criteria"]
    criterion_ids = {item["id"] for item in criteria}
    failed = value.get("failed_criteria", [])
    if not isinstance(failed, list) or any(item not in criterion_ids for item in failed):
        raise ValueError("failed criteria do not match the lesson")
    hint_level = value.get("hint_level", 0)
    if isinstance(hint_level, float) and hint_level.is_integer():
        hint_level = int(hint_level)
    # Live tutor + Finn ladder: H0 unused / H1–H2 non-answer only (no walkthrough H3–H4).
    if not isinstance(hint_level, int) or hint_level < 0 or hint_level > 2:
        raise ValueError("invalid hint level")

    return {
        "lesson_id": lesson_id,
        "screen_id": screen_id,
        "prompt": screen["prompt"],
        "criteria": criteria,
        "status": status,
        "failed_criteria": failed,
        "hint_level": hint_level,
        "learner_text": "",
    }
