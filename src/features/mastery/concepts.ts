import type { ConceptId } from "../learning-episode/types";

export type ConceptNode = {
  id: ConceptId;
  label: string;
  /** plain-language "what this means" (spec §6.2 knowledge graph) */
  meaning: string;
  prerequisites: ConceptId[];
  chapterId: string;
};

export const CONCEPTS: ConceptNode[] = [
  {
    id: "gross-vs-net",
    label: "Gross vs net pay",
    meaning: "Your contract salary is not what lands in your account. Deductions come first.",
    prerequisites: [],
    chapterId: "ch0",
  },
  {
    id: "cpf-contribution",
    label: "CPF contributions",
    meaning: "20% of your pay goes to CPF accounts you still own — plus 17% from your employer.",
    prerequisites: ["gross-vs-net"],
    chapterId: "ch0",
  },
  {
    id: "pay-yourself-first",
    label: "Pay yourself first",
    meaning: "Money routed to savings on payday gets saved. Money left in spending gets spent.",
    prerequisites: [],
    chapterId: "ch0",
  },
  {
    id: "emergency-buffer",
    label: "Emergency buffer",
    meaning: "A cash cushion turns a shock from a debt event into an inconvenience.",
    prerequisites: ["pay-yourself-first"],
    chapterId: "ch0",
  },
  {
    id: "fixed-vs-flexible",
    label: "Fixed vs flexible costs",
    meaning: "Rent won't shrink when you need it to. Only flexible costs can absorb a shock.",
    prerequisites: [],
    chapterId: "ch1",
  },
  {
    id: "budget-shock",
    label: "Surviving a shock month",
    meaning: "A plan that only works in a perfect month is not a plan.",
    prerequisites: ["fixed-vs-flexible", "emergency-buffer"],
    chapterId: "ch1",
  },
  {
    id: "minimum-payment",
    label: "The minimum payment trap",
    meaning: "Minimum payments mostly service interest. The balance barely moves.",
    prerequisites: [],
    chapterId: "ch1",
  },
  {
    id: "apr-total-cost",
    label: "APR and total cost",
    meaning: "Compare borrowing by total cost over time, not by the monthly amount.",
    prerequisites: ["minimum-payment"],
    chapterId: "ch1",
  },
  {
    id: "interest-multiplier",
    label: "Interest as a multiplier",
    meaning: "Interest multiplies whatever balance you feed it — debt or savings — over time.",
    prerequisites: ["pay-yourself-first"],
    chapterId: "ch-lab",
  },
  {
    id: "wait-cost",
    label: "The cost of waiting",
    meaning: "Delaying a save-first route usually feeds interest nothing — the gap shows up when you scrub the years.",
    prerequisites: ["interest-multiplier"],
    chapterId: "ch-lab",
  },
  {
    id: "diversification",
    label: "Diversification",
    meaning: "Spreading money across investments reduces how much one bad outcome can hurt the whole portfolio.",
    prerequisites: [],
    chapterId: "ch-lab",
  },
  {
    id: "dollar-cost-averaging",
    label: "Dollar-cost averaging",
    meaning: "Investing a fixed amount on a schedule buys at many prices — so you don't have to time the perfect day.",
    prerequisites: [],
    chapterId: "ch-lab",
  },
];

export const conceptById = (id: ConceptId): ConceptNode | undefined => CONCEPTS.find((c) => c.id === id);
