from __future__ import annotations

import re

FALLBACK_QUESTION = "Which visible criterion would you test next?"

_DISALLOWED = re.compile(
    r"\b(answer|correct|choose|select|set|enter|the value is|the payment is|which value is|you should|do this|\d)\b",
    re.IGNORECASE,
)


def safe_spoken_hint(text: str) -> bool:
    normalized = " ".join(text.split())
    if not normalized or len(normalized.split()) > 25:
        return False
    if normalized.count("?") != 1 or not normalized.endswith("?"):
        return False
    return _DISALLOWED.search(normalized) is None
