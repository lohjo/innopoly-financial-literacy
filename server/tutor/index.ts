#!/usr/bin/env node
/**
 * Finfy TypeScript Live Tutor server.
 * GET /healthz  |  WS /ws/{learner_id}/{session_id}
 *
 * Without GEMINI_API_KEY / GOOGLE_API_KEY: healthz reports degraded; WS accepts
 * context validation but refuses live narration (UI still teaches offline).
 */

import http from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer, type WebSocket, type RawData } from "ws";
import { loadTutorConfig } from "./config";
import { validateContext, type ValidatedLessonContext } from "./contracts";
import { type SessionState } from "./grounding";
import { connectLiveBridge, type LiveBridge } from "./liveBridge";
import { tutorLog } from "./log";
import { filterLearnerText } from "./policy";

const config = loadTutorConfig();
const AUDIO_CHUNK_BYTES = 3200;

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": [...config.allowedOrigins][0] ?? "*",
    "access-control-allow-headers": "content-type, x-tutor-token",
    "access-control-allow-methods": "GET, OPTIONS",
  };
}

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json", ...corsHeaders() });
  res.end(JSON.stringify(body));
}

function authorizedHttp(req: http.IncomingMessage): boolean {
  if (!config.accessToken) return true;
  return req.headers["x-tutor-token"] === config.accessToken;
}

function allowedWs(req: http.IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (origin && !config.allowedOrigins.has(origin)) return false;
  if (!config.accessToken) return true;
  const headerToken = req.headers["x-tutor-token"];
  const protocols = String(req.headers["sec-websocket-protocol"] ?? "")
    .split(",")
    .map((s) => s.trim());
  const protocolToken = protocols.find((p) => p.startsWith("token."))?.slice(6);
  return headerToken === config.accessToken || protocolToken === config.accessToken;
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.url?.split("?")[0] === "/healthz") {
    if (!authorizedHttp(req)) {
      json(res, 401, { status: "error", message: "Unauthorized" });
      return;
    }
    json(res, 200, {
      status: config.configured ? "ok" : "degraded",
      model: config.model,
      live: config.configured ? "configured" : "unconfigured",
    });
    return;
  }

  json(res, 404, { status: "error", message: "Not found" });
});

const wss = new WebSocketServer({
  noServer: true,
  handleProtocols(protocols) {
    for (const p of protocols) {
      if (p.startsWith("token.")) return p;
    }
    // No token subprotocol offered — allow header/no-auth paths.
    return protocols.size === 0 ? "" : false;
  },
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const match = url.pathname.match(/^\/ws\/([^/]+)\/([^/]+)$/);
  if (!match) {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }
  if (!allowedWs(req)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    void handleTutorSocket(ws, match[2]);
  });
});

async function handleTutorSocket(ws: WebSocket, sessionId: string): Promise<void> {
  const traceId = randomUUID();
  const state: SessionState = { allowed_criteria: [], lesson_context: {} };
  let bridge: LiveBridge | null = null;
  let liveReady = false;
  let lastLearnerText: string | null = null;
  let lastLearnerTextAt = 0;
  let audioChunks = Buffer.alloc(0);

  const send = (payload: Record<string, unknown>) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  };

  tutorLog({ trace_id: traceId, event: "session_created", session_id: sessionId });

  const ensureBridge = async (): Promise<LiveBridge | null> => {
    if (bridge) return bridge;
    if (!config.configured) {
      send({
        type: "error",
        message: "Live tutor is unconfigured (missing GEMINI_API_KEY). Lesson hints still work offline.",
      });
      return null;
    }
    try {
      bridge = await connectLiveBridge(
        config,
        state,
        {
          onClientEvent: (payload) => send(payload),
          onRender: (command) => send({ type: "tutor_render", command }),
          onError: (message) => send({ type: "error", message }),
          onReady: () => {
            liveReady = true;
            send({ type: "live_ready", model: config.model, config: "ok" });
          },
        },
        traceId,
      );
      setTimeout(() => {
        if (!liveReady && bridge) {
          liveReady = true;
          send({ type: "live_ready", model: config.model, config: "ok" });
        }
      }, 1500);
      return bridge;
    } catch (err) {
      tutorLog({
        trace_id: traceId,
        event: "live_connect_failed",
        error: err instanceof Error ? err.message : String(err),
      });
      send({ type: "error", message: "Finn's live session ended. Reconnect and try again." });
      return null;
    }
  };

  if (config.configured) {
    void ensureBridge();
  } else {
    liveReady = false;
    send({ type: "live_ready", model: config.model, config: "degraded" });
  }

  ws.on("message", (data: RawData, isBinary: boolean) => {
    void (async () => {
      if (isBinary) {
        if (!liveReady) return;
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
        audioChunks = Buffer.concat([audioChunks, buf]);
        const b = await ensureBridge();
        if (!b) return;
        while (audioChunks.length >= AUDIO_CHUNK_BYTES) {
          const chunk = audioChunks.subarray(0, AUDIO_CHUNK_BYTES);
          audioChunks = audioChunks.subarray(AUDIO_CHUNK_BYTES);
          b.sendAudio(Buffer.from(chunk));
        }
        return;
      }

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(String(data)) as Record<string, unknown>;
      } catch {
        send({ type: "error", message: "Malformed tutor event." });
        return;
      }

      if (payload.type === "context") {
        try {
          const context: ValidatedLessonContext = validateContext(payload.context);
          state.allowed_criteria = context.criteria.map((c) => c.id);
          state.lesson_context = context;
          tutorLog({
            trace_id: traceId,
            event: "context_applied",
            screen_id: context.screen_id,
            hint_level: context.hint_level,
          });
          send({ type: "context_ready", screen_id: context.screen_id });
        } catch (err) {
          tutorLog({
            trace_id: traceId,
            event: "context_rejected",
            reason: err instanceof Error ? err.message : String(err),
          });
          send({ type: "error", message: "Lesson context was rejected." });
        }
        return;
      }

      if (payload.type === "text") {
        if (!state.lesson_context || !("lesson_id" in state.lesson_context)) {
          send({ type: "error", message: "Open a lesson question before asking Finn." });
          return;
        }
        const filtered = filterLearnerText(String(payload.content ?? ""));
        if (!filtered.ok) {
          if (filtered.reason === "injection_prefilter") {
            send({
              type: "error",
              message: "I can only help with this lesson. Which visible criterion should we test first?",
            });
          }
          return;
        }
        const now = Date.now();
        if (filtered.text === lastLearnerText && now - lastLearnerTextAt < 1500) return;
        lastLearnerText = filtered.text;
        lastLearnerTextAt = now;

        const b = await ensureBridge();
        if (!b) return;
        b.sendText(filtered.text);
        tutorLog({
          trace_id: traceId,
          event: "learner_text",
          screen_id: (state.lesson_context as ValidatedLessonContext).screen_id,
        });
      }
    })();
  });

  ws.on("close", () => {
    tutorLog({ trace_id: traceId, event: "client_disconnected", session_id: sessionId });
    bridge?.close();
    bridge = null;
  });
}

server.listen(config.port, () => {
  tutorLog({
    event: "tutor_listen",
    port: config.port,
    live: config.configured ? "configured" : "degraded",
    model: config.model,
  });
});
