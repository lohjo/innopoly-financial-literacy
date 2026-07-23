export function tutorLog(fields: Record<string, unknown>): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...fields });
  console.log(line);
}
