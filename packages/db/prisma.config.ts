import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Supabase: use the *direct* (session mode, port 5432) connection string
    // for migrations; the pooled (transaction mode, port 6543) string for the app.
    // The placeholder keeps offline commands (generate, migrate diff) working.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/darbha",
  },
});
