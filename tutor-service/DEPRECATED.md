# Deprecated — Python Live tutor

This FastAPI + Google ADK service is **deprecated** as the required local runtime.

**Use instead:** `server/tutor/` (TypeScript), started by `pnpm run dev`.

**Rollback** (if TS Live breaks):

```bash
cd tutor-service
# activate .venv if present
uvicorn app.main:app --reload --port 8080
```

Point the app at `VITE_TUTOR_WS_URL=ws://localhost:8080/ws` (bypass the Vite `/tutor-ws` proxy).

Delete this directory only with explicit maintainer approval.
