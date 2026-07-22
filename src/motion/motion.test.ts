import { describe, expect, it } from "vitest";
import { dur, ease, spring } from "./tokens";
import { cardEnter, glowPulse, heroFloat, hoverLift, pressSpring, screenEnter } from "./transitions";

describe("motion tokens (plan 001 §13.1)", () => {
  it("durations stay inside the spec bands", () => {
    expect(dur.micro).toBeGreaterThanOrEqual(0.08);
    expect(dur.micro).toBeLessThanOrEqual(0.1);
    expect(dur.hover).toBe(0.22);
    expect(dur.card).toBe(0.35);
    expect(dur.page).toBe(0.5);
    expect(dur.celebrate).toBeLessThanOrEqual(0.8);
  });

  it("easings map the CSS var curves exactly (no invented curves)", () => {
    expect(ease.enter).toEqual([0.16, 1, 0.3, 1]);
    expect(ease.exit).toEqual([0.4, 0, 1, 1]);
    expect(ease.state).toEqual([0.2, 0, 0, 1]);
  });

  it("tap spring is a spring", () => {
    expect(spring.tap.type).toBe("spring");
  });
});

describe("transition presets", () => {
  it("pressSpring compresses to 0.96 and springs back", () => {
    expect(pressSpring(false).whileTap).toEqual({ scale: 0.96 });
    expect(pressSpring(false).transition).toEqual(spring.tap);
  });

  it("pressSpring collapses to no transform under reduce-motion", () => {
    expect(pressSpring(true).whileTap).toBeUndefined();
    expect(pressSpring(true).transition).toEqual({ duration: 0 });
  });

  it("screenEnter fades + rises 20px at page duration", () => {
    const s = screenEnter(false);
    expect(s.initial).toEqual({ opacity: 0, y: 20 });
    expect(s.transition?.duration).toBe(dur.page);
  });

  it("screenEnter collapses to no entrance under reduce-motion", () => {
    expect(screenEnter(true).initial).toBe(false);
  });

  it("cardEnter carries stagger delay and card duration", () => {
    const c = cardEnter(false, 0.12);
    expect(c.transition?.duration).toBe(dur.card);
    expect(c.transition?.delay).toBe(0.12);
  });

  it("hoverLift lifts 2px at hover duration", () => {
    expect(hoverLift(false).whileHover?.y).toBe(-2);
    expect(hoverLift(false).transition.duration).toBe(dur.hover);
    expect(hoverLift(true).whileHover).toBeUndefined();
  });

  it("ambient presets loop forever and disappear under reduce-motion", () => {
    expect(glowPulse(false).transition?.repeat).toBe(Infinity);
    expect(glowPulse(false).transition?.duration).toBe(2);
    expect(heroFloat(false).transition?.repeat).toBe(Infinity);
    expect(heroFloat(false).transition?.duration).toBe(6);
    expect(glowPulse(true)).toEqual({});
    expect(heroFloat(true)).toEqual({});
  });
});
