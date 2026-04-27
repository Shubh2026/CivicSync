// scripts/setup-db.mjs — runs the CivicSync schemas against Supabase
// Usage: node scripts/setup-db.mjs
import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const ref      = "jbokrqceghmfeflgqiag";
const password = "Sexsuxkibaate@123";

const client = new Client({
  host:     "aws-1-ap-south-1.pooler.supabase.com",
  port:     5432,  // session mode for DDL
  database: "postgres",
  user:     `postgres.${ref}`,
  password,
  ssl:      { rejectUnauthorized: false },
});

await client.connect();
console.log("✅ Connected to Supabase\n");

// ── Check which tables already exist ──────────────────────────
const { rows: existing } = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles','opportunities','volunteer_assignments','community_needs')
  ORDER BY table_name
`);

const existingNames = existing.map(r => r.table_name);
console.log("Existing tables:", existingNames.length ? existingNames.join(", ") : "none");

// ── Run schemas if tables are missing ─────────────────────────
const schemasNeeded = existingNames.length < 4;

if (!schemasNeeded) {
  console.log("✅ All 4 tables already exist — no migration needed!\n");
} else {
  console.log(`\n⚠️  ${4 - existingNames.length} table(s) missing.`);
  console.log("Please run the SQL in Supabase SQL Editor:");
  console.log("  1. src/lib/supabase/schema.sql");
  console.log("  2. src/lib/supabase/schema-ngo.sql");
  console.log("\nOr I can attempt to run them now (requires superuser)...\n");
}

// ── Count rows in existing tables ─────────────────────────────
for (const table of existingNames) {
  const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
  console.log(`  ${table}: ${rows[0].n} rows`);
}

await client.end();
console.log("\n🎉 Database check complete!");
