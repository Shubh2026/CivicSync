// prisma.config.ts — Prisma 7 schema path configuration
// The database adapter is passed directly to PrismaClient in src/lib/prisma.ts

import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
});
