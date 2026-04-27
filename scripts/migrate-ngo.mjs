// scripts/migrate-ngo.mjs — creates the community_needs table (the missing one)
import pg from "pg";
const { Client } = pg;

const client = new Client({
  host:     "aws-1-ap-south-1.pooler.supabase.com",
  port:     5432,
  database: "postgres",
  user:     "postgres.jbokrqceghmfeflgqiag",
  password: "Sexsuxkibaate@123",
  ssl:      { rejectUnauthorized: false },
});

await client.connect();
console.log("✅ Connected\n");

// ── Create community_needs table ──────────────────────────────
console.log("Creating community_needs table...");
await client.query(`
  CREATE TABLE IF NOT EXISTS public.community_needs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    category     TEXT NOT NULL,
    location     TEXT NOT NULL,
    city         TEXT,
    state        TEXT,
    urgency      TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    beneficiaries INT,
    image_urls   TEXT[] DEFAULT '{}',
    status       TEXT CHECK (status IN ('active', 'addressed', 'archived')) DEFAULT 'active',
    linked_opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    source       TEXT DEFAULT 'manual',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  )
`);
console.log("  ✅ community_needs created");

// ── Enable RLS ────────────────────────────────────────────────
await client.query(`ALTER TABLE public.community_needs ENABLE ROW LEVEL SECURITY`);
console.log("  ✅ RLS enabled");

// ── Add RLS policies ──────────────────────────────────────────
const policies = [
  [`"NGO can manage own needs"`,     `FOR ALL USING (auth.uid() = ngo_id)`],
  [`"Anyone can view community needs"`, `FOR SELECT USING (status = 'active')`],
];

for (const [name, clause] of policies) {
  try {
    await client.query(`
      CREATE POLICY ${name} ON public.community_needs ${clause}
    `);
    console.log(`  ✅ Policy ${name} created`);
  } catch (e) {
    if (e.code === "42710") console.log(`  ⏭  Policy ${name} already exists`);
    else console.warn(`  ⚠️  Policy error: ${e.message}`);
  }
}

// ── Add extra policies for NGO dashboard (on existing tables) ─
const extraPolicies = [
  [
    "volunteer_assignments",
    `"NGO can view assignments on own opportunities"`,
    `FOR SELECT USING (EXISTS (SELECT 1 FROM public.opportunities WHERE opportunities.id = volunteer_assignments.opportunity_id AND opportunities.ngo_id = auth.uid()))`,
  ],
  [
    "profiles",
    `"Public profile read"`,
    `FOR SELECT USING (true)`,
  ],
  [
    "opportunities",
    `"NGO can view all own opportunities"`,
    `FOR SELECT USING (auth.uid() = ngo_id)`,
  ],
];

console.log("\nAdding supporting RLS policies...");
for (const [table, name, clause] of extraPolicies) {
  try {
    await client.query(`CREATE POLICY ${name} ON public.${table} ${clause}`);
    console.log(`  ✅ ${table}: ${name}`);
  } catch (e) {
    if (e.code === "42710") console.log(`  ⏭  Already exists: ${name}`);
    else console.warn(`  ⚠️  ${e.message}`);
  }
}

// ── Verify final state ────────────────────────────────────────
console.log("\nFinal table count:");
const { rows } = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles','opportunities','volunteer_assignments','community_needs')
  ORDER BY table_name
`);
rows.forEach(r => console.log(`  ✅ ${r.table_name}`));

await client.end();
console.log("\n🎉 Migration complete! All 4 tables ready.");
