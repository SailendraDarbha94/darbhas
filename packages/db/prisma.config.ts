import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Supabase: use the session-mode pooler (port 5432) here - it's the one
    // connection used for migrations, seed, and the app in this project, and
    // transaction-mode PgBouncer (port 6543) doesn't reliably support migrations.
    // The placeholder keeps offline commands (generate, migrate diff) working.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/darbha",
  },
});
