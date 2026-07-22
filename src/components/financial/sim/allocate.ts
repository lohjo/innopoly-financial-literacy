/* Chip→bucket allocation grader. Pure. */
export type AllocateAnswer = { placement: Record<string, string> };

export function evaluateAllocate(
  params: {
    chips: { id: string; amount: number }[];
    buckets: { id: string; kind: "save" | "spend" }[];
    targets: { minSave: number };
  },
  answer: AllocateAnswer,
): { id: string; pass: boolean; detail?: string }[] {
  const saveIds = new Set(params.buckets.filter((b) => b.kind === "save").map((b) => b.id));
  let saved = 0;
  for (const chip of params.chips) {
    const bucket = answer.placement[chip.id];
    if (bucket && saveIds.has(bucket)) saved += chip.amount;
  }
  const pass = saved + 1e-6 >= params.targets.minSave;
  return [
    {
      id: "min-save",
      pass,
      detail: pass
        ? undefined
        : `Only $${Math.round(saved).toLocaleString("en-US")} routed to save-first — need at least $${params.targets.minSave.toLocaleString("en-US")}.`,
    },
  ];
}

export function sumInKind(
  params: {
    chips: { id: string; amount: number }[];
    buckets: { id: string; kind: "save" | "spend" }[];
  },
  placement: Record<string, string>,
  kind: "save" | "spend",
): number {
  const ids = new Set(params.buckets.filter((b) => b.kind === kind).map((b) => b.id));
  return params.chips.reduce((sum, c) => (ids.has(placement[c.id] ?? "") ? sum + c.amount : sum), 0);
}
