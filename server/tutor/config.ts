export type TutorServerConfig = {
  port: number;
  accessToken: string | undefined;
  allowedOrigins: Set<string>;
  model: string;
  apiKey: string | undefined;
  configured: boolean;
};

export function loadTutorConfig(env: NodeJS.ProcessEnv = process.env): TutorServerConfig {
  const allowedOrigins = new Set(
    (env.TUTOR_ALLOWED_ORIGINS ?? "http://localhost:5173")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const apiKey = env.GEMINI_API_KEY?.trim() || env.GOOGLE_API_KEY?.trim() || undefined;
  return {
    port: Number(env.TUTOR_PORT ?? 8080) || 8080,
    accessToken: env.TUTOR_ACCESS_TOKEN?.trim() || undefined,
    allowedOrigins,
    model: env.GEMINI_LIVE_MODEL?.trim() || "gemini-2.5-flash-native-audio-preview-12-2025",
    apiKey,
    configured: Boolean(apiKey),
  };
}
