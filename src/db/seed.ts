// Multi-student fixture loader. Seeds the v0.2 demo corpus into Neon via the
// `withStudent` RLS envelope (see src/db/client.ts).
//
// Idempotency: per-student by default. If a student already has any
// `mirror_entries` rows, that student is skipped — re-running after a partial
// seed only fills in the missing students. Set SEED_REPLACE_EXISTING=1 to reset
// the selected seed students before inserting the fixture.
//
// tsvector columns (`story_reframe_tsv`, `verbatim_quote_tsv`) are GENERATED
// ALWAYS AS in the schema, so they populate automatically on INSERT — no
// SQLite-FTS5 → Postgres translation step is needed in the seed itself.
