// Drizzle TypeScript schema — source of truth for Postgres (Neon).
// Replaces v0.1 `schema.sql` per docs/plans/_archive/2026-05-12-002-feat-managed-agents-full-migration-plan.md §5.1.
//
// Every table that carries `student_id` enables RLS with a policy that compares
// against the `app.student_id` GUC set inside `withStudent` (see src/db/client.ts).
// Cross-tenant reads require an out-of-band query (none currently exist).
