from __future__ import annotations

from google.adk.tools.tool_context import ToolContext

from .contracts import TutorRenderCommand


def get_lesson_context(tool_context: ToolContext) -> dict:
    """Read the current server-validated lesson context before replying to a learner. This contains only the visible prompt, criteria, learner artifact summary, and failed-criterion feedback. It never contains an answer or solution."""
    context = tool_context.state.get("lesson_context")
    if not isinstance(context, dict):
        return {"status": "error", "message": "No active lesson context is available."}
    return {"status": "success", "lesson_context": context}


def render_hint_focus(
    action: str,
    criterion_id: str | None = None,
) -> dict:
    """Render a non-mutating tutor cue. Use only to pulse Finn or highlight one visible lesson criterion.

    Args:
        action: Exactly one of highlight_criterion, clear_highlight, or pulse_tutor.
        criterion_id: Required only for highlight_criterion. It must be the id of a criterion visible in the current lesson.
    """
    command = TutorRenderCommand(action=action, criterion_id=criterion_id)
    return {"status": "success", "render_command": command.as_dict()}
