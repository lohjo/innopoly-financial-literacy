import { describe, expect, it } from "vitest";
import { voicePhaseFor } from "./voicePhase";

describe("Clicky-shaped voicePhase mapping", () => {
  it("maps Live statuses onto idle|listening|processing|responding", () => {
    expect(voicePhaseFor("idle")).toBe("idle");
    expect(voicePhaseFor("ready")).toBe("idle");
    expect(voicePhaseFor("error")).toBe("idle");
    expect(voicePhaseFor("listening")).toBe("listening");
    expect(voicePhaseFor("connecting")).toBe("processing");
    expect(voicePhaseFor("speaking")).toBe("responding");
  });
});
