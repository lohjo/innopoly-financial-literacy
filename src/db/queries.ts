// Drizzle-backed query layer for Postgres (Neon). Replaces the v0.1
// better-sqlite3 implementation per docs/plans/_archive/2026-05-12-002-feat-managed-agents-full-migration-plan.md §5.
//
// Every public function preserves its v0.1 signature
//   (studentId: string, input, opts?: { ctx?: TenantContext }) => Promise<…>
// but is now async. When `opts.ctx` is supplied, the function reuses the
// caller's transaction (via `ctx.db`); when omitted, it opens its own
// `withStudent(studentId, …)` envelope. Postgres rejects nested transactions,
// so we never call `withStudent` inside another `withStudent` — the inner
// `*Inner` helpers just take `ctx` and run.
//
// Row-level security enforces `student_id = current_setting('app.student_id')`
// on every tenancy-scoped table. The query layer still keeps explicit
// student_id predicates on reads/updates as a belt-and-suspenders guard for
// local/dev databases whose connection role may own the tables and therefore
// bypass non-FORCE RLS.