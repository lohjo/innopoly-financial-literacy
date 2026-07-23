/* Clear env binding accessor — generative helpers stay off unless explicitly enabled. */

export type AgentRuntimeConfig = {
  /** Master switch for optional phrasing helpers (default: false). */
  managedAgentsEnabled: boolean;
  /** Optional provider key presence (never logged). */
  hasGeminiKey: boolean;
  hasOpenAiKey: boolean;
};

function truthy(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

/** Browser-safe: Vite exposes only VITE_* ; Node tutor server may also call this. */
export function loadAgentRuntimeConfig(
  env: Record<string, string | undefined> = typeof import.meta !== "undefined"
    ? (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {}
    : {},
): AgentRuntimeConfig {
  const nodeEnv =
    typeof process !== "undefined" && process.env
      ? (process.env as Record<string, string | undefined>)
      : {};
  const merged = { ...nodeEnv, ...env };

  return {
    managedAgentsEnabled: truthy(merged.VITE_MANAGED_AGENTS) || truthy(merged.MANAGED_AGENTS),
    hasGeminiKey: Boolean(merged.GEMINI_API_KEY || merged.GOOGLE_API_KEY || merged.VITE_GEMINI_API_KEY),
    hasOpenAiKey: Boolean(merged.OPENAI_API_KEY),
  };
}

export function requireEnv(name: string, env: Record<string, string | undefined> = process.env): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
