/* Exact-order grading for sort puzzles. Pure. */
export type SortAnswer = { order: string[] };

export function evaluateSort(
  params: { correctOrder: string[] },
  answer: SortAnswer,
): { id: string; pass: boolean; detail?: string }[] {
  const ok =
    answer.order.length === params.correctOrder.length &&
    answer.order.every((id, i) => id === params.correctOrder[i]);
  return [
    {
      id: "order-correct",
      pass: ok,
      detail: ok ? undefined : "Not quite — think about what compounds over years, not what feels urgent today.",
    },
  ];
}
