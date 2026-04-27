// scripts/test-db.mjs — full Prisma end-to-end test against live Supabase
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const url = process.env.DATABASE_URL;
if (!url || url.includes("YOUR_DB_PASSWORD")) {
  console.error("❌ DATABASE_URL not set correctly in .env.local");
  process.exit(1);
}

console.log("🔌 Connecting via Prisma...");

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  // ── Test each model ────────────────────────────────────────
  const [profileCount, oppCount, needCount, assignCount] = await Promise.all([
    prisma.profile.count(),
    prisma.opportunity.count(),
    prisma.communityNeed.count(),
    prisma.volunteerAcceptance.count(),
  ]);

  console.log("✅ Prisma connected to live Supabase database!\n");
  console.log("  Table                   Rows");
  console.log("  ─────────────────────── ────");
  console.log(`  profiles                ${profileCount}`);
  console.log(`  opportunities           ${oppCount}`);
  console.log(`  community_needs         ${needCount}`);
  console.log(`  volunteer_assignments   ${assignCount}`);

  // ── Test opportunity query with include ───────────────────
  const firstOpp = await prisma.opportunity.findFirst({
    select: { id: true, title: true, category: true, city: true, urgency: true },
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  if (firstOpp) {
    console.log(`\n✅ Sample opportunity: "${firstOpp.title}" (${firstOpp.category} — ${firstOpp.city})`);
  }

  console.log("\n🎉 All Prisma models operational — backend fully connected!");

} catch (err) {
  console.error("❌ Prisma error:", err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
