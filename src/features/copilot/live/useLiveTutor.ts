import { useCallback, useEffect, useRef, useState } from "react";
import { voicePhaseFor, type LiveTutorStatus, type TutorVoicePhase } from "./voicePhase";

export type { TutorVoicePhase } from "./voicePhase";
export { voicePhaseFor } from "./voicePhase";

export type TutorCriterion = { id: string; label: string; state: "pending" | "pass" | "fail" };

export type TutorContext = {
  lesson_id: string;
  screen_id: string;
  prompt: string;
  criteria: TutorCriterion[];
  status: "idle" | "dirty" | "evaluating" | "success" | "failure";
  failed_criteria: string[];
  hint_level: number;
};

type RenderCommand = { layer?: string; action?: string; criterion_id?: string };
type Options = {
  onCommand?: (command: RenderCommand) => void;
  /** Barge-in: clear in-flight bubble/highlight when the learner starts speaking/asking. */
  onBargeIn?: () => void;
};

/** Accept layered tutor_render commands or raw tool args (action/criterion_id). */
function normalizeRenderCommand(command: RenderCommand): RenderCommand {
  const action = command.action;
  if (!action) return command;
  return {
    layer: command.layer ?? "lesson_tutor",
    action,
    criterion_id: command.criterion_id,
  };
}

// Dev default hits the Vite /tutor-ws proxy so StudyCopilot Ask/Mic work without a hand-written .env.
const TUTOR_URL =
  (import.meta.env.VITE_TUTOR_WS_URL as string | undefined) ||
  (import.meta.env.DEV ? "ws://localhost:5173/tutor-ws" : undefined);
const TUTOR_TOKEN = import.meta.env.VITE_TUTOR_ACCESS_TOKEN as string | undefined;
const SESSION_STORAGE_KEY = "finfy-live-tutor-session";

function stableId(key: string): string {
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(key, created);
  return created;
}

const base64ToArrayBuffer = (base64: string) => {
  const decoded = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) bytes[index] = decoded.charCodeAt(index);
  return bytes.buffer;
};

/** Orion-style Float32 → Int16 PCM; Vertex Live rejects/floods on raw float frames. */
function float32ToPcm16(input: Float32Array): ArrayBuffer {
  const pcm = new Int16Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] ?? 0));
    pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return pcm.buffer;
}

function contextKey(context: TutorContext): string {
  return JSON.stringify({
    lesson_id: context.lesson_id,
    screen_id: context.screen_id,
    status: context.status,
    failed_criteria: context.failed_criteria,
    hint_level: Math.min(2, context.hint_level),
  });
}

function socketUrl(): string | null {
  if (!TUTOR_URL) return null;
  return `${TUTOR_URL.replace(/\/$/, "")}/browser-${stableId(`${SESSION_STORAGE_KEY}-learner`)}/${stableId(SESSION_STORAGE_KEY)}`;
}

export function useLiveTutor({ onCommand, onBargeIn }: Options = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const connectingRef = useRef<Promise<boolean> | null>(null);
  const contextRef = useRef<TutorContext | null>(null);
  const lastSentContextKeyRef = useRef<string | null>(null);
  const askingRef = useRef(false);
  const liveReadyRef = useRef(false);
  const onCommandRef = useRef(onCommand);
  const onBargeInRef = useRef(onBargeIn);
  const recorderContextRef = useRef<AudioContext | null>(null);
  const playerContextRef = useRef<AudioContext | null>(null);
  const recorderNodeRef = useRef<AudioWorkletNode | null>(null);
  const playerNodeRef = useRef<AudioWorkletNode | null>(null);
  const microphoneRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<LiveTutorStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { onBargeInRef.current = onBargeIn; }, [onBargeIn]);

  const stopListening = useCallback(() => {
    recorderNodeRef.current?.disconnect();
    recorderNodeRef.current = null;
    microphoneRef.current?.getTracks().forEach((track) => track.stop());
    microphoneRef.current = null;
    void recorderContextRef.current?.close();
    recorderContextRef.current = null;
    setStatus((current) => current === "listening" ? "ready" : current);
  }, []);

  const disconnect = useCallback(() => {
    stopListening();
    wsRef.current?.close();
    wsRef.current = null;
    connectingRef.current = null;
    lastSentContextKeyRef.current = null;
    askingRef.current = false;
    liveReadyRef.current = false;
    playerNodeRef.current?.disconnect();
    playerNodeRef.current = null;
    void playerContextRef.current?.close();
    playerContextRef.current = null;
    setStatus("idle");
  }, [stopListening]);

  useEffect(() => disconnect, [disconnect]);

  const sendContext = useCallback((force = false) => {
    const ws = wsRef.current;
    const context = contextRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !context) return false;
    const key = contextKey(context);
    if (!force && lastSentContextKeyRef.current === key) return true;
    const payload = {
      ...context,
      hint_level: Math.min(2, Math.max(0, context.hint_level)),
    };
    ws.send(JSON.stringify({ type: "context", context: payload }));
    lastSentContextKeyRef.current = key;
    return true;
  }, []);

  const setContext = useCallback((context: TutorContext) => {
    contextRef.current = context;
    setTranscript(null);
    sendContext();
  }, [sendContext]);

  const startPlayer = useCallback(async () => {
    if (playerNodeRef.current) {
      if (playerContextRef.current?.state === "suspended") await playerContextRef.current.resume();
      return;
    }
    const context = new AudioContext({ sampleRate: 24000 });
    await context.audioWorklet.addModule("/tutor-worklets/pcm-player-processor.js");
    const node = new AudioWorkletNode(context, "finfy-pcm-player");
    node.connect(context.destination);
    if (context.state === "suspended") await context.resume();
    playerContextRef.current = context;
    playerNodeRef.current = node;
  }, []);

  const connect = useCallback(async () => {
    if (!TUTOR_URL) {
      setError("Live tutor is not configured.");
      return false;
    }
    // #region agent log
    fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'A',location:'useLiveTutor.ts:connect:entry',message:'connect() called',data:{readyState:wsRef.current?.readyState ?? null,hasConnectingPromise:Boolean(connectingRef.current)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (wsRef.current?.readyState === WebSocket.OPEN) return true;
    if (wsRef.current?.readyState === WebSocket.CONNECTING && connectingRef.current) {
      return connectingRef.current;
    }
    if (connectingRef.current) return connectingRef.current;

    setStatus("connecting");
    setError(null);
    const url = socketUrl();
    if (!url) return false;

    // #region agent log
    fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'A',location:'useLiveTutor.ts:connect:new-ws',message:'spawning new WebSocket',data:{urlTail:url.slice(-40)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const pending = new Promise<boolean>((resolve) => {
      const ws = new WebSocket(url, TUTOR_TOKEN ? [`token.${TUTOR_TOKEN}`] : undefined);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;
      ws.onopen = () => {
        // #region agent log
        fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'A',location:'useLiveTutor.ts:ws.onopen',message:'WebSocket OPEN',data:{},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setStatus("ready");
        lastSentContextKeyRef.current = null;
        liveReadyRef.current = false;
        sendContext(true);
        resolve(true);
      };
      ws.onerror = () => {
        // #region agent log
        fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'A',location:'useLiveTutor.ts:ws.onerror',message:'WebSocket error',data:{},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setStatus("error");
        setError("Finn could not connect. Use the lesson hints and try again later.");
        resolve(false);
      };
      ws.onclose = (ev) => {
        // #region agent log
        fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'C',location:'useLiveTutor.ts:ws.onclose',message:'WebSocket closed',data:{code:ev.code,reason:ev.reason,wasClean:ev.wasClean},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (wsRef.current === ws) wsRef.current = null;
        setStatus((current) => current === "error" ? current : "idle");
      };
      ws.onmessage = ({ data }) => {
        let event: Record<string, unknown>;
        try { event = JSON.parse(String(data)) as Record<string, unknown>; } catch { return; }
        // #region agent log
        if (event.type === "error" || event.type === "context_ready" || event.turnComplete || event.turn_complete) {
          fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'B',location:'useLiveTutor.ts:ws.onmessage',message:'WS event received',data:{type:event.type ?? null,hasError:typeof event.message==='string',keys:Object.keys(event).slice(0,12)},timestamp:Date.now()})}).catch(()=>{});
        }
        // #endregion
        if (event.type === "error" && typeof event.message === "string") {
          setStatus("error");
          setError(event.message);
          return;
        }
        // Mic ungated only when Live is truly ready — not in degraded (no API key) mode.
        if (event.type === "live_ready" && event.config !== "degraded") {
          liveReadyRef.current = true;
        }
        // Typed render command from TS tutor server (and dual-read with legacy ADK shapes).
        if (event.type === "tutor_render") {
          const command = event.command as RenderCommand | undefined;
          if (command) onCommandRef.current?.(normalizeRenderCommand(command));
        }
        const output = (event.outputTranscription ?? event.output_transcription) as { text?: unknown } | undefined;
        if (typeof output?.text === "string" && output.text.trim()) {
          setTranscript(output.text.trim());
          setStatus("speaking");
        }
        const parts = ((event.content as { parts?: unknown[] } | undefined)?.parts ?? []) as Array<Record<string, unknown>>;
        for (const part of parts) {
          const inlineData = (part.inlineData ?? part.inline_data) as { data?: unknown; mimeType?: unknown; mime_type?: unknown } | undefined;
          const mimeType = inlineData?.mimeType ?? inlineData?.mime_type;
          if (typeof inlineData?.data === "string" && typeof mimeType === "string" && mimeType.startsWith("audio/pcm")) {
            const audio = inlineData.data;
            void startPlayer().then(() => playerNodeRef.current?.port.postMessage(base64ToArrayBuffer(audio)));
            setStatus("speaking");
          }
          const functionCall = (part.functionCall ?? part.function_call) as { name?: unknown; args?: unknown; arguments?: unknown } | undefined;
          if (functionCall?.name === "render_hint_focus") {
            const command = (functionCall.args ?? functionCall.arguments) as RenderCommand | undefined;
            if (command) onCommandRef.current?.(normalizeRenderCommand(command));
          }
        }
        if (event.turnComplete ?? event.turn_complete) setStatus("ready");
      };
    });
    connectingRef.current = pending;
    void pending.finally(() => { connectingRef.current = null; });
    return pending;
  }, [sendContext, startPlayer]);

  const startListening = useCallback(async () => {
    if (!(await connect())) return false;
    if (recorderNodeRef.current) return true;
    // Clicky barge-in: cancel in-flight speech/UI when the learner starts talking.
    onBargeInRef.current?.();
    setTranscript(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      const context = new AudioContext({ sampleRate: 16000 });
      await context.audioWorklet.addModule("/tutor-worklets/pcm-recorder-processor.js");
      if (context.state === "suspended") await context.resume();
      const node = new AudioWorkletNode(context, "finfy-pcm-recorder");
      node.port.onmessage = ({ data }) => {
        const ws = wsRef.current;
        if (ws?.readyState !== WebSocket.OPEN || !liveReadyRef.current) return;
        const floats = data instanceof Float32Array ? data : new Float32Array(data as ArrayBuffer);
        ws.send(float32ToPcm16(floats));
      };
      const source = context.createMediaStreamSource(stream);
      source.connect(node);
      recorderContextRef.current = context;
      recorderNodeRef.current = node;
      microphoneRef.current = stream;
      setStatus("listening");
      return true;
    } catch {
      setError("Microphone access is unavailable. You can still type a question.");
      return false;
    }
  }, [connect]);

  const activate = useCallback(async () => {
    await startPlayer();
    return connect();
  }, [connect, startPlayer]);

  const ask = useCallback((content: string) => {
    const ws = wsRef.current;
    if (!content.trim() || !ws || ws.readyState !== WebSocket.OPEN || !contextRef.current) return false;
    if (askingRef.current) return false;
    askingRef.current = true;
    onBargeInRef.current?.();
    setTranscript(null);
    // Context is state-only on the server; send at most once per change, then one text turn.
    sendContext();
    ws.send(JSON.stringify({ type: "text", content: content.trim().slice(0, 500) }));
    setStatus("listening");
    window.setTimeout(() => { askingRef.current = false; }, 750);
    // #region agent log
    fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'D',location:'useLiveTutor.ts:ask',message:'ask sent once',data:{len:content.trim().length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return true;
  }, [sendContext]);

  return {
    available: Boolean(TUTOR_URL),
    status,
    voicePhase: voicePhaseFor(status),
    error,
    transcript,
    activate,
    ask,
    setContext,
    stopListening,
    startListening,
  };
}
