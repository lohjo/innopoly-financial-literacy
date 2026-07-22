/* Pairing grader for match puzzles. Pure. */
export type MatchAnswer = { pairs: Record<string, string> };

export function evaluateMatch(
  params: { left: { id: string }[]; solution: Record<string, string> },
  answer: MatchAnswer,
): { id: string; pass: boolean; detail?: string }[] {
  const allPaired = params.left.every((l) => Boolean(answer.pairs[l.id]));
  const allCorrect = params.left.every((l) => answer.pairs[l.id] === params.solution[l.id]);
  return [
    {
      id: "all-matched",
      pass: allPaired && allCorrect,
      detail: allPaired
        ? allCorrect
          ? undefined
          : "One or more pairs are swapped — interest feeds whatever you leave unpaid or undernourished."
        : "Pair every card on the left before checking.",
    },
  ];
}
