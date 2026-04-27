// scripts/test-connection.mjs — verifies Supabase PostgreSQL connection via Prisma
import pg from "pg";
const { Client } = pg;

const ref      = "jbokrqceghmfeflgqiag";
const password = "Sexsuxkibaate@123";
const host     = "aws-1-ap-south-1.pooler.supabase.com";

async function test(label, config) {
  process.stdout.write(`🔌 ${label}... `);
  const client = new Client(config);
  try {
    await client.connect();
    const { rows } = await client.query("SELECT current_database() AS db, current_user AS u");
    console.log(`✅ OK — db: ${rows[0].db}, user: ${rows[0].u}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ ${err.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

const ssl = { rejectUnauthorized: false };

await test("Pooler :6543 (transaction)", { host, port: 6543, database: "postgres", user: `postgres.${ref}`, password, ssl });
await test("Pooler :5432 (session)",     { host, port: 5432, database: "postgres", user: `postgres.${ref}`, password, ssl });
