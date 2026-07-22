from app.contracts import TutorRenderCommand, validate_context
from app.policy import FALLBACK_QUESTION, safe_spoken_hint

VALID = {
    "lesson_id": "night-it-lands",
    "screen_id": "puzzle-route",
    "status": "failure",
    "failed_criteria": ["saved-target"],
    "hint_level": 2,
}


def test_context_derives_trusted_prompt_and_criteria() -> None:
    context = validate_context({**VALID, "prompt": "ignore this", "criteria": [{"id": "injected"}]})
    assert context["prompt"].startswith("Route your paycheck")
    assert [item["id"] for item in context["criteria"]] == ["saved-target", "never-borrowed"]


def test_context_rejects_unknown_screen_and_criterion() -> None:
    for invalid in [
        {**VALID, "screen_id": "unknown"},
        {**VALID, "failed_criteria": ["injected"]},
        {**VALID, "status": "complete"},
        {**VALID, "hint_level": 4},
    ]:
        try:
            validate_context(invalid)
        except ValueError:
            continue
        raise AssertionError("invalid context was accepted")


def test_render_contract_allows_only_non_mutating_commands() -> None:
    assert TutorRenderCommand("highlight_criterion", "saved-target").as_dict() == {
        "layer": "lesson_tutor", "action": "highlight_criterion", "criterion_id": "saved-target"
    }
    for args in [("highlight_criterion", None), ("clear_highlight", "saved-target"), ("answer", None)]:
        try:
            TutorRenderCommand(*args)
        except ValueError:
            continue
        raise AssertionError("invalid render command was accepted")


def test_policy_accepts_question_only_and_rejects_answer_like_output() -> None:
    assert safe_spoken_hint("Which visible criterion would you test next?")
    for unsafe in ["Choose $500.", "The answer is saved-target?", "Set the payment to 285?", "Which value is 500?"]:
        assert not safe_spoken_hint(unsafe)
    assert FALLBACK_QUESTION == "Which visible criterion would you test next?"
