# Note on dual Live runtimes

**ADK + Gemini Live (`tutor-service/`) remains a supported Live root** — see `README.md`.

The TypeScript server at `server/tutor/` is a protocol-compatible twin (same contracts/policy/tools) for single-command Node DX. Prefer:

| Goal | Runtime |
| --- | --- |
| Canonical ADK Live pattern / Vertex ADK parity | `TUTOR_RUNTIME=adk` |
| Pure TS / no Python venv | `TUTOR_RUNTIME=ts` (default when `.venv` missing) |

Do not delete this directory without maintainer approval — it is the ADK reference implementation.
