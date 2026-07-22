from __future__ import annotations

import asyncio
import json
import logging
import os
import time
import uuid
from contextlib import aclosing
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv()

# #region agent log
_DEBUG_LOG_PATH = Path(__file__).resolve().parents[2] / "debug-9556f0.log"


def _agent_log(hypothesis_id: str, location: str, message: str, data: dict[str, Any] | None = None) -> None:
    try:
        payload = {
            "sessionId": "9556f0",
            "runId": "post-fix",
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data or {},
            "timestamp": int(time.time() * 1000),
        }
        with _DEBUG_LOG_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload) + "\n")
    except Exception:
        pass
# #endregion

from fastapi import FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google.adk.agents.live_request_queue import LiveRequestQueue
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.events import Event
from google.adk.events.event_actions import EventActions
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from .agent import MODEL, root_agent
from .contracts import validate_context

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("finfy_live_tutor")

APP_NAME = "finfy_live_tutor"
AUDIO_CHUNK_BYTES = 3200
ALLOWED_ORIGINS = {item.strip() for item in os.environ.get("TUTOR_ALLOWED_ORIGINS", "http://localhost:5173").split(",") if item.strip()}

app = FastAPI(title="Finfy Live Tutor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(ALLOWED_ORIGINS),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["content-type", "x-tutor-token"],
)
session_service = InMemorySessionService()
runner = Runner(app_name=APP_NAME, agent=root_agent, session_service=session_service)
TUTOR_ACCESS_TOKEN = os.environ.get("TUTOR_ACCESS_TOKEN")


@app.get("/healthz")
async def healthz(x_tutor_token: str | None = Header(default=None)) -> dict[str, str]:
    if TUTOR_ACCESS_TOKEN and x_tutor_token != TUTOR_ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"status": "ok", "model": MODEL}


def allowed_client(websocket: WebSocket) -> bool:
    origin = websocket.headers.get("origin")
    header_token = websocket.headers.get("x-tutor-token")
    protocols = [item.strip() for item in websocket.headers.get("sec-websocket-protocol", "").split(",")]
    protocol_token = next((item[6:] for item in protocols if item.startswith("token.")), None)
    if origin is not None and origin not in ALLOWED_ORIGINS:
        return False
    return not TUTOR_ACCESS_TOKEN or header_token == TUTOR_ACCESS_TOKEN or protocol_token == TUTOR_ACCESS_TOKEN


@app.websocket("/ws/{learner_id}/{session_id}")
async def live_tutor(websocket: WebSocket, learner_id: str, session_id: str) -> None:
    if not allowed_client(websocket):
        await websocket.close(code=1008)
        return

    # Browser sends Sec-WebSocket-Protocol: token.<secret>. Starlette requires
    # accept(subprotocol=...) to echo it back or the handshake fails.
    protocols = [item.strip() for item in websocket.headers.get("sec-websocket-protocol", "").split(",") if item.strip()]
    token_protocol = next((item for item in protocols if item.startswith("token.")), None)
    await websocket.accept(subprotocol=token_protocol)

    trace_id = str(uuid.uuid4())
    send_lock = asyncio.Lock()
    live_ready = asyncio.Event()
    last_learner_text: str | None = None
    last_learner_text_at = 0.0

    async def send_event(payload: dict[str, Any]) -> None:
        async with send_lock:
            await websocket.send_text(json.dumps(payload))

    session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=learner_id,
        session_id=session_id,
    )
    if session is None:
        session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=learner_id,
            session_id=session_id,
            state={"allowed_criteria": [], "lesson_context": {}},
        )
        logger.info(json.dumps({"trace_id": trace_id, "event": "session_created", "session_id": session_id}))
        # #region agent log
        _agent_log("A", "main.py:live_tutor:session_created", "ADK session created", {"session_id": session_id, "model": MODEL})
        # #endregion
    else:
        logger.info(json.dumps({"trace_id": trace_id, "event": "session_resumed", "session_id": session_id}))
        # #region agent log
        _agent_log("A", "main.py:live_tutor:session_resumed", "ADK session resumed (possible dual socket)", {"session_id": session_id, "model": MODEL})
        # #endregion

    queue = LiveRequestQueue()
    # Mirror orion-main: AUDIO RunConfig only for native-audio models.
    # Half-cascade + AUDIO is the combination that was dying at Vertex connect.
    is_native_audio = "native-audio" in MODEL or "native" in MODEL
    if is_native_audio:
        run_config = RunConfig(
            streaming_mode=StreamingMode.BIDI,
            response_modalities=["AUDIO"],
            input_audio_transcription=types.AudioTranscriptionConfig(),
            output_audio_transcription=types.AudioTranscriptionConfig(),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Sadaltager")
                )
            ),
        )
        modalities = ["AUDIO"]
    else:
        run_config = RunConfig(
            streaming_mode=StreamingMode.BIDI,
            response_modalities=["TEXT"],
        )
        modalities = ["TEXT"]
    # #region agent log
    _agent_log(
        "B",
        "main.py:live_tutor:run_config",
        "starting run_live",
        {"model": MODEL, "voice": "Sadaltager" if is_native_audio else None, "modalities": modalities, "is_native_audio": is_native_audio, "session_id": session_id},
    )
    # #endregion

    async def upstream() -> None:
        nonlocal last_learner_text, last_learner_text_at
        audio_buffer = bytearray()
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                raise WebSocketDisconnect()
            binary = message.get("bytes")
            if binary:
                # Drop mic frames until Vertex Live is actually up — early PCM
                # floods cause 1011 "sending data too fast".
                if not live_ready.is_set():
                    continue
                audio_buffer.extend(binary)
                while len(audio_buffer) >= AUDIO_CHUNK_BYTES:
                    chunk = bytes(audio_buffer[:AUDIO_CHUNK_BYTES])
                    del audio_buffer[:AUDIO_CHUNK_BYTES]
                    queue.send_realtime(types.Blob(data=chunk, mime_type="audio/pcm"))
                continue

            text = message.get("text")
            if not text:
                continue
            try:
                payload = json.loads(text)
            except json.JSONDecodeError:
                await send_event({"type": "error", "message": "Malformed tutor event."})
                continue

            message_type = payload.get("type")
            if message_type == "context":
                try:
                    context = validate_context(payload.get("context"))
                except (TypeError, ValueError) as exc:
                    logger.info(json.dumps({"trace_id": trace_id, "event": "context_rejected", "reason": str(exc)}))
                    await send_event({"type": "error", "message": "Lesson context was rejected."})
                    continue
                allowed_criteria = [item["id"] for item in context["criteria"]]
                # State-only update — never append user Content during run_live.
                # Content turns get replayed into the Live model and flood it
                # (many replies / 1011 "sending data too fast").
                await session_service.append_event(
                    session,
                    Event(
                        author="system",
                        actions=EventActions(
                            state_delta={
                                "allowed_criteria": allowed_criteria,
                                "lesson_context": context,
                            }
                        ),
                    ),
                )
                # #region agent log
                _agent_log("D", "main.py:context", "state-only context applied", {"screen_id": context["screen_id"], "hint_level": context["hint_level"]})
                # #endregion
                await send_event({"type": "context_ready", "screen_id": context["screen_id"]})
                continue

            if message_type == "text":
                context = session.state.get("lesson_context", {})
                if not context:
                    await send_event({"type": "error", "message": "Open a lesson question before asking Finn."})
                    continue
                learner_text = str(payload.get("content", "")).strip()[:500]
                if not learner_text:
                    continue
                now = time.monotonic()
                if learner_text == last_learner_text and (now - last_learner_text_at) < 1.5:
                    # #region agent log
                    _agent_log("D", "main.py:learner_text:deduped", "dropped duplicate learner text", {"screen_id": context["screen_id"], "len": len(learner_text)})
                    # #endregion
                    continue
                last_learner_text = learner_text
                last_learner_text_at = now
                queue.send_content(
                    types.Content(
                        role="user",
                        parts=[types.Part(text=learner_text)],
                    )
                )
                logger.info(json.dumps({"trace_id": trace_id, "event": "learner_text", "screen_id": context["screen_id"]}))
                # #region agent log
                _agent_log("D", "main.py:learner_text", "queued learner text once", {"screen_id": context["screen_id"], "len": len(learner_text)})
                # #endregion

    async def downstream() -> None:
        event_count = 0

        async def unlock_mic_soon() -> None:
            await asyncio.sleep(1.5)
            if not live_ready.is_set():
                live_ready.set()
                try:
                    await send_event({"type": "live_ready", "model": MODEL})
                except Exception:
                    pass
                # #region agent log
                _agent_log("B", "main.py:downstream:live_ready_timer", "mic ungated after connect grace", {"session_id": session_id})
                # #endregion

        unlock_task = asyncio.create_task(unlock_mic_soon())
        try:
            async with aclosing(runner.run_live(session=session, live_request_queue=queue, run_config=run_config)) as events:
                async for event in events:
                    if not live_ready.is_set():
                        live_ready.set()
                        await send_event({"type": "live_ready", "model": MODEL})
                        # #region agent log
                        _agent_log("B", "main.py:downstream:live_ready", "first live event; mic ungated", {"session_id": session_id})
                        # #endregion
                    event_count += 1
                    if event_count <= 3:
                        # #region agent log
                        _agent_log(
                            "B",
                            "main.py:downstream:event",
                            "live event received",
                            {
                                "n": event_count,
                                "author": getattr(event, "author", None),
                                "partial": getattr(event, "partial", None),
                                "turn_complete": getattr(event, "turn_complete", None),
                            },
                        )
                        # #endregion
                    # mode="json" base64-encodes audio bytes so websocket JSON stays valid.
                    event_dict = event.model_dump(exclude_none=True, by_alias=True, mode="json")
                    await send_event(event_dict)
            # #region agent log
            _agent_log("B", "main.py:downstream:ended", "run_live iterator ended cleanly", {"event_count": event_count, "session_id": session_id})
            # #endregion
        except Exception as exc:
            # #region agent log
            _agent_log(
                "B",
                "main.py:downstream:exception",
                "run_live failed",
                {"error": str(exc), "error_type": type(exc).__name__, "event_count": event_count, "session_id": session_id},
            )
            # #endregion
            raise
        finally:
            unlock_task.cancel()
            try:
                await unlock_task
            except (asyncio.CancelledError, Exception):
                pass

    # FIRST_EXCEPTION (orion-main / ADK adk_web_server): keep the socket open
    # across normal turn completion; only tear down on real errors/disconnect.
    up = asyncio.create_task(upstream())
    down = asyncio.create_task(downstream())
    done, pending = await asyncio.wait([up, down], return_when=asyncio.FIRST_EXCEPTION)
    try:
        for task in done:
            task.result()
    except WebSocketDisconnect:
        logger.info(json.dumps({"trace_id": trace_id, "event": "client_disconnected"}))
        # #region agent log
        _agent_log("C", "main.py:live_tutor:client_disconnected", "client WebSocketDisconnect", {"session_id": session_id})
        # #endregion
    except Exception as exc:
        logger.exception(json.dumps({"trace_id": trace_id, "event": "live_session_failed", "error": str(exc)}))
        # #region agent log
        _agent_log(
            "B",
            "main.py:live_tutor:live_session_failed",
            "live session failed at wait",
            {"error": str(exc), "error_type": type(exc).__name__, "session_id": session_id},
        )
        # #endregion
        try:
            await send_event({"type": "error", "message": "Finn's live session ended. Reconnect and try again."})
        except Exception:
            pass
    finally:
        # #region agent log
        _agent_log(
            "C",
            "main.py:live_tutor:finally",
            "closing live tutor websocket",
            {
                "session_id": session_id,
                "up_done": up.done(),
                "down_done": down.done(),
                "down_exc": repr(down.exception()) if down.done() and not down.cancelled() else None,
            },
        )
        # #endregion
        for task in pending:
            task.cancel()
            try:
                await task
            except (asyncio.CancelledError, Exception):
                pass
        queue.close()
        try:
            await websocket.close()
        except Exception:
            pass
