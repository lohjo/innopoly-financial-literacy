"""Guard tests for the grounding layer in app.agent (before/after tool callbacks).

These are pure-function tests: before_tool/after_tool only ever touch
`tool.name` and `tool_context.state`, so we stand in with minimal stubs
rather than constructing real ADK BaseTool/ToolContext instances.
"""

from app.agent import after_tool, before_tool


class _StubTool:
    def __init__(self, name: str) -> None:
        self.name = name


class _StubToolContext:
    def __init__(self, state: dict) -> None:
        self.state = state


def _ctx(allowed_criteria: list[str]) -> _StubToolContext:
    return _StubToolContext({"allowed_criteria": allowed_criteria})


def test_before_tool_rejects_unknown_tool_name() -> None:
    result = before_tool(_StubTool("get_lesson_context"), {}, _ctx([]))
    assert result == {"status": "error", "message": "Tool is not permitted."}


def test_before_tool_rejects_invalid_action() -> None:
    result = before_tool(_StubTool("render_hint_focus"), {"action": "answer"}, _ctx([]))
    assert result is not None and result["status"] == "error"


def test_before_tool_rejects_highlight_outside_allowlist() -> None:
    result = before_tool(
        _StubTool("render_hint_focus"),
        {"action": "highlight_criterion", "criterion_id": "injected"},
        _ctx(["saved-target"]),
    )
    assert result is not None and result["status"] == "error"


def test_before_tool_accepts_highlight_within_allowlist() -> None:
    result = before_tool(
        _StubTool("render_hint_focus"),
        {"action": "highlight_criterion", "criterion_id": "saved-target"},
        _ctx(["saved-target"]),
    )
    assert result is None


def test_before_tool_rejects_criterion_id_on_non_highlight_action() -> None:
    result = before_tool(
        _StubTool("render_hint_focus"),
        {"action": "pulse_tutor", "criterion_id": "saved-target"},
        _ctx(["saved-target"]),
    )
    assert result is not None and result["status"] == "error"


def test_before_tool_accepts_pulse_and_clear_without_criterion() -> None:
    for action in ("pulse_tutor", "clear_highlight"):
        result = before_tool(_StubTool("render_hint_focus"), {"action": action}, _ctx([]))
        assert result is None


def test_after_tool_rejects_missing_render_command() -> None:
    result = after_tool(_StubTool("render_hint_focus"), {}, _ctx([]), {"status": "success"})
    assert result is not None and result["status"] == "error"


def test_after_tool_rejects_wrong_layer() -> None:
    tool_response = {"status": "success", "render_command": {"layer": "clinical", "action": "show"}}
    result = after_tool(_StubTool("render_hint_focus"), {}, _ctx([]), tool_response)
    assert result is not None and result["status"] == "error"


def test_after_tool_accepts_lesson_tutor_layer() -> None:
    tool_response = {"status": "success", "render_command": {"layer": "lesson_tutor", "action": "pulse_tutor"}}
    result = after_tool(_StubTool("render_hint_focus"), {}, _ctx([]), tool_response)
    assert result is None
