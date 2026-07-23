# Live tutor — Google ADK + Gemini Live (canonical pattern)

This service is the **canonical** conversational Live root for Finfy:

- Google ADK `Runner.run_live` + Gemini Live native audio
- Deny-by-default tool grounding (`before_tool` / `after_tool`)
- Hint-only tools: `get_lesson_context`, `render_hint_focus`

The TypeScript twin at `server/tutor/` mirrors the same contracts/policy/grounding with `@google/genai` Live when you prefer a single-package Node stack.

## Run (via root DX)

```bash
# Prefer ADK when tutor-service/.venv exists (default), else TS twin:
pnpm run dev

# Force ADK or TS:
TUTOR_RUNTIME=adk pnpm run dev
TUTOR_RUNTIME=ts pnpm run dev
```

Standalone:

```bash
cd tutor-service
# create .venv + pip install -e ".[test]" if needed
uvicorn app.main:app --reload --port 8080
```

Point the app at `VITE_TUTOR_WS_URL=ws://localhost:5173/tutor-ws` (Vite proxy) or `ws://localhost:8080/ws`.
