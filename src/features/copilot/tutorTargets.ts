/* Spatial pointing: map tutor target ids to DOM selectors and compute overlay
   geometry from measured rects. Pure math — the DOM reads live in TutorPointer. */

export type Frame = { left: number; top: number; width: number; height: number };

/** CSS.escape without depending on the DOM global (ids are author-controlled slugs,
    but never trust them into a selector unescaped). */
export function resolveTutorSelector(targetId: string): string {
  const escaped = targetId.replace(/["\\]/g, "\\$&");
  return `[data-tutor-target="${escaped}"]`;
}

/** Ring frame: the target rect padded outward so the ring sits around, not on, the element. */
export function ringFrame(rect: Frame, pad = 6): Frame {
  return {
    left: rect.left - pad,
    top: rect.top - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}

/** Note placement: below the target when there's room, else above; horizontally
    clamped to the viewport with an 8px gutter. */
export function notePlacement(
  rect: Frame,
  viewport: { width: number; height: number },
  note: { width: number; height: number },
): { left: number; top: number; side: "above" | "below" } {
  const gap = 10;
  const gutter = 8;
  const below = rect.top + rect.height + gap + note.height <= viewport.height - gutter;
  const top = below ? rect.top + rect.height + gap : Math.max(gutter, rect.top - gap - note.height);
  const left = Math.min(Math.max(gutter, rect.left), Math.max(gutter, viewport.width - note.width - gutter));
  return { left, top, side: below ? "below" : "above" };
}

/** Whether the target is visibly inside the viewport (used to decide scroll-into-view). */
export function isOffscreen(rect: Frame, viewport: { width: number; height: number }): boolean {
  return rect.top + rect.height < 0 || rect.top > viewport.height || rect.left + rect.width < 0 || rect.left > viewport.width;
}
