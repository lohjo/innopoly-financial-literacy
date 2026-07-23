/* Gemini Live session bridge via @google/genai — narrate + allowlisted UI tools only. */

import { GoogleGenAI, Modality, type Session } from "@google/genai";
import type { TutorServerConfig } from "./config";
import {
  executeTool,
  FINN_SYSTEM_INSTRUCTION,
  LIVE_TOOLS,
  type SessionState,
} from "./grounding";
import { tutorLog } from "./log";
import type { TutorRenderCommand } from "./contracts";

export type LiveBridgeHandlers = {
  onClientEvent: (payload: Record<string, unknown>) => void;
  onRender: (command: TutorRenderCommand) => void;
  onError: (message: string) => void;
  onReady: () => void;
};

export type LiveBridge = {
  sendText: (text: string) => void;
  sendAudio: (pcm: Buffer) => void;
  close: () => void;
};

export async function connectLiveBridge(
  config: TutorServerConfig,
  state: SessionState,
  handlers: LiveBridgeHandlers,
  traceId: string,
): Promise<LiveBridge | null> {
  if (!config.apiKey) return null;

  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  let session: Session | null = null;
  let closed = false;

  const isNativeAudio = /native-audio|native/i.test(config.model);

  session = await ai.live.connect({
    model: config.model,
    config: {
      responseModalities: isNativeAudio ? [Modality.AUDIO] : [Modality.TEXT],
      systemInstruction: FINN_SYSTEM_INSTRUCTION,
      tools: LIVE_TOOLS as never,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      speechConfig: isNativeAudio
        ? {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Sadaltager" },
            },
          }
        : undefined,
    },
    callbacks: {
      onopen: () => {
        tutorLog({ trace_id: traceId, event: "gemini_live_open", model: config.model });
        handlers.onReady();
      },
      onmessage: (message) => {
        void handleMessage(message as unknown as Record<string, unknown>);
      },
      onerror: (e) => {
        tutorLog({
          trace_id: traceId,
          event: "gemini_live_error",
          error: (e as { message?: string })?.message ?? "error",
        });
        handlers.onError("Finn's live session hit an error. Reconnect and try again.");
      },
      onclose: (e) => {
        tutorLog({
          trace_id: traceId,
          event: "gemini_live_close",
          reason: (e as { reason?: string })?.reason ?? "",
        });
      },
    },
  });

  async function handleToolCalls(message: Record<string, unknown>): Promise<void> {
    const toolCall = (message.toolCall ?? message.tool_call) as
      | { functionCalls?: Array<{ id?: string; name?: string; args?: Record<string, unknown> }> }
      | undefined;
    const calls = toolCall?.functionCalls ?? [];
    if (!calls.length || !session) return;

    const functionResponses: Array<{ id?: string; name: string; response: Record<string, unknown> }> = [];
    for (const fc of calls) {
      const name = fc.name ?? "";
      const args = (fc.args ?? {}) as Record<string, unknown>;
      const result = executeTool(name, args, state);
      if (result.status === "success" && result.render_command) {
        handlers.onRender(result.render_command as TutorRenderCommand);
        // Also emit legacy-shaped functionCall so older clients still see action/criterion.
        handlers.onClientEvent({
          content: {
            parts: [
              {
                functionCall: {
                  name: "render_hint_focus",
                  args: result.render_command,
                },
              },
            ],
          },
        });
      }
      functionResponses.push({
        id: fc.id,
        name,
        response: result,
      });
    }
    session.sendToolResponse({ functionResponses });
  }

  async function handleMessage(message: Record<string, unknown>): Promise<void> {
    if (closed) return;
    if (message.toolCall || message.tool_call) {
      await handleToolCalls(message);
    }

    const serverContent = (message.serverContent ?? message.server_content) as
      | {
          modelTurn?: { parts?: unknown[] };
          model_turn?: { parts?: unknown[] };
          outputTranscription?: { text?: string };
          output_transcription?: { text?: string };
          turnComplete?: boolean;
          turn_complete?: boolean;
        }
      | undefined;

    if (!serverContent) return;

    const parts = serverContent.modelTurn?.parts ?? serverContent.model_turn?.parts ?? [];
    const output =
      serverContent.outputTranscription?.text ?? serverContent.output_transcription?.text;
    const turnComplete = serverContent.turnComplete ?? serverContent.turn_complete;

    const normalizedParts: Array<Record<string, unknown>> = [];
    for (const part of parts) {
      const p = part as Record<string, unknown>;
      const inline = (p.inlineData ?? p.inline_data) as
        | { data?: string; mimeType?: string; mime_type?: string }
        | undefined;
      if (inline?.data) {
        normalizedParts.push({
          inlineData: {
            data: inline.data,
            mimeType: inline.mimeType ?? inline.mime_type ?? "audio/pcm",
          },
        });
      }
      // Some SDK builds put raw base64 on message.data
    }

    // @google/genai may also surface audio as message.data
    const data = message.data;
    if (typeof data === "string" && data.length > 0) {
      normalizedParts.push({
        inlineData: { data, mimeType: "audio/pcm;rate=24000" },
      });
    }

    const payload: Record<string, unknown> = {};
    if (output) payload.outputTranscription = { text: output };
    if (normalizedParts.length) payload.content = { parts: normalizedParts };
    if (turnComplete) payload.turnComplete = true;
    if (Object.keys(payload).length) handlers.onClientEvent(payload);
  }

  return {
    sendText(text: string) {
      if (!session || closed) return;
      // Prefer realtime text for conversational turns (Live API guidance).
      session.sendRealtimeInput({ text });
    },
    sendAudio(pcm: Buffer) {
      if (!session || closed) return;
      session.sendRealtimeInput({
        audio: {
          data: pcm.toString("base64"),
          mimeType: "audio/pcm;rate=16000",
        },
      });
    },
    close() {
      closed = true;
      try {
        session?.close();
      } catch {
        /* ignore */
      }
      session = null;
    },
  };
}
