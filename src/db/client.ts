// Postgres client + tenancy envelope. Replaces the v0.1 better-sqlite3 path.
//
// `withStudent(studentId, fn)` is the *only* sanctioned entry point into the
// app's read/write paths. It opens a transaction, sets the per-statement
// `app.student_id` GUC via `set_config(_, _, true)` (SET LOCAL semantics), and
// hands a transaction-bound Drizzle client to `fn`. Every RLS policy in
// schema.ts compares student_id against this GUC, so a query inside `fn` that
// forgets to scope by student_id sees zero rows (sane failure mode).
//
// Two non-obvious invariants:
//
//   1. The `set_config` call is the FIRST statement issued on the transaction.
//      Any earlier query runs without the GUC and returns zero rows under RLS.
//      Drizzle's `tx` callback executes statements in await order, so we
//      simply `await` the GUC set before invoking `fn`.
//
//   2. The Neon pooled URL uses PgBouncer transaction mode. node-postgres
//      (`pg`) only issues named prepared statements when callers pass a
//      `name` field — Drizzle's `drizzle-orm/node-postgres` adapter does not,
//      so we are already PgBouncer-transaction-mode-safe without a flag.
//      `set_config(_, _, true)` (LOCAL=true) is transaction-scoped, which is
//      exactly what PgBouncer-transaction-mode preserves.