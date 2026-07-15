// drizzle-kit configuration. Reads from .env via the consumer (Vite/tsx loads
// dotenv at runtime); here we just point at the schema + migrations folder.
//
// Use `DATABASE_URL_UNPOOLED` (Neon direct, non-pooled) for migrations because
// PgBouncer transaction mode does not support session-scoped statements like
// `CREATE INDEX CONCURRENTLY` or schema DDL across many statements.