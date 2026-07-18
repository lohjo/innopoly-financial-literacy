/* Fictional cohort peers for the league card (real small peer groups per MR-6 come with a backend). */
export type Player = { id: string; name: string; points: number; streak: number };

export const peers: Player[] = [
  { id: "priya", name: "Priya", points: 1780, streak: 21 },
  { id: "marcus", name: "Marcus", points: 1750, streak: 14 },
  { id: "ava", name: "Ava", points: 1420, streak: 9 },
  { id: "leo", name: "Leo", points: 1180, streak: 5 },
];
