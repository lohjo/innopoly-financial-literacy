/** Clicky-shaped voice phase (farzaa/clicky CompanionVoiceState) mapped onto Live statuses. */

export type LiveTutorStatus = "idle" | "connecting" | "ready" | "listening" | "speaking" | "error";
export type TutorVoicePhase = "idle" | "listening" | "processing" | "responding";

export function voicePhaseFor(status: LiveTutorStatus): TutorVoicePhase {
  switch (status) {
    case "listening":
      return "listening";
    case "connecting":
      return "processing";
    case "speaking":
      return "responding";
    default:
      return "idle";
  }
}
