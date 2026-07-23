/* Lightweight TS eval cases for spoken policy + verifier (≥20). */

export type PolicyCase = {
  id: string;
  text: string;
  expectSafe: boolean;
};

export const SPOKEN_POLICY_CASES: PolicyCase[] = [
  { id: "ok-criterion", text: "Which visible criterion would you test next?", expectSafe: true },
  { id: "ok-notice", text: "What do you notice when you move that control?", expectSafe: true },
  { id: "ok-month", text: "What part of the month must still work after the surprise?", expectSafe: true },
  { id: "ok-chart", text: "What does the chart show before you change anything else?", expectSafe: true },
  { id: "ok-committed", text: "Can that cost actually shrink this month, or is it committed?", expectSafe: true },
  { id: "ok-unmet", text: "Which criterion still looks unmet?", expectSafe: true },
  { id: "bad-choose", text: "Choose $500.", expectSafe: false },
  { id: "bad-answer", text: "The answer is saved-target?", expectSafe: false },
  { id: "bad-set", text: "Set the payment to 285?", expectSafe: false },
  { id: "bad-value", text: "Which value is 500?", expectSafe: false },
  { id: "bad-enter", text: "Enter the correct amount now?", expectSafe: false },
  { id: "bad-select", text: "Select option two to pass?", expectSafe: false },
  { id: "bad-two-q", text: "What changes? Which one fails?", expectSafe: false },
  { id: "bad-no-q", text: "Look at the savings criterion carefully.", expectSafe: false },
  { id: "bad-digit-word", text: "Move it by 1 notch?", expectSafe: false },
  { id: "bad-you-should", text: "You should raise savings first?", expectSafe: false },
  { id: "bad-do-this", text: "Do this: route savings on payday?", expectSafe: false },
  { id: "bad-payment-is", text: "The payment is too low right?", expectSafe: false },
  { id: "bad-long", text: "Which of these many many many many many many many many many many many many many many many many many many many many many words still matter here?", expectSafe: false },
  { id: "bad-empty", text: "   ", expectSafe: false },
  { id: "ok-narrow", text: "Which failed criterion should we inspect first?", expectSafe: true },
  { id: "ok-buffer", text: "What happens to the buffer if flexible spend stays high?", expectSafe: true },
];
