/* Provider-agnostic generative seam — used only AFTER deterministic gates decide mode. */

export type ManagedAgentTransport = {
  /** Return model text (typically JSON). Fake transports used in unit tests. */
  complete(input: {
    system: string;
    user: string;
    jsonSchemaHint?: string;
    traceId?: string;
  }): Promise<string>;
};

export type VerifierRejectCode =
  | "digits"
  | "criterion"
  | "outcome_claim"
  | "xp_claim"
  | "policy"
  | "schema"
  | "gate_order";

export type VerifierResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string; code: VerifierRejectCode };

export type ManagedAgentBinding = {
  name: string;
  systemPrompt: string;
  /** When false/undefined, runner returns null without calling transport. */
  enabled?: boolean;
};

export type RunManagedAgentResult<T> =
  | { status: "ok"; value: T; traceId: string }
  | { status: "disabled"; traceId: string }
  | { status: "rejected"; reason: string; code: VerifierRejectCode; traceId: string }
  | { status: "error"; reason: string; traceId: string };
