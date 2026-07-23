import type { z } from "zod";
import { loadAgentRuntimeConfig } from "./config";
import type {
  ManagedAgentBinding,
  ManagedAgentTransport,
  RunManagedAgentResult,
  VerifierResult,
} from "./types";
import { parseJsonObject } from "./verifier";

function newTraceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * SenseMake-shaped primitive: transport → JSON → schema → verifier → value.
 * Default path is disabled (no-op) unless MANAGED_AGENTS / VITE_MANAGED_AGENTS is on.
 */
export async function runManagedAgent<T>(
  binding: ManagedAgentBinding,
  input: { user: string; jsonSchemaHint?: string },
  schema: z.ZodType<T>,
  opts: {
    transport: ManagedAgentTransport;
    verify: (value: T) => VerifierResult<T>;
    enabled?: boolean;
    traceId?: string;
  },
): Promise<RunManagedAgentResult<T>> {
  const traceId = opts.traceId ?? newTraceId();
  const config = loadAgentRuntimeConfig();
  const enabled = opts.enabled ?? binding.enabled ?? config.managedAgentsEnabled;

  if (!enabled) {
    return { status: "disabled", traceId };
  }

  try {
    const rawText = await opts.transport.complete({
      system: binding.systemPrompt,
      user: input.user,
      jsonSchemaHint: input.jsonSchemaHint,
      traceId,
    });
    let parsed: unknown;
    try {
      parsed = parseJsonObject(rawText);
    } catch {
      return { status: "rejected", reason: "model output is not JSON", code: "schema", traceId };
    }
    const schemaResult = schema.safeParse(parsed);
    if (!schemaResult.success) {
      return { status: "rejected", reason: schemaResult.error.message, code: "schema", traceId };
    }
    const verified = opts.verify(schemaResult.data);
    if (!verified.ok) {
      return { status: "rejected", reason: verified.reason, code: verified.code, traceId };
    }
    return { status: "ok", value: verified.value, traceId };
  } catch (err) {
    return {
      status: "error",
      reason: err instanceof Error ? err.message : "managed agent failed",
      traceId,
    };
  }
}

/** No-op transport for production default (never hits a network). */
export const stubTransport: ManagedAgentTransport = {
  async complete() {
    throw new Error("stub transport: managed agents disabled");
  },
};

export function fakeTransport(response: string | (() => string)): ManagedAgentTransport {
  return {
    async complete() {
      return typeof response === "function" ? response() : response;
    },
  };
}
