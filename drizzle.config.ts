import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./app/infrastructure/database/schema.ts",
    out: "./app/infrastructure/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URI as string,
    },
    verbose: true,
    strict: true,
});
