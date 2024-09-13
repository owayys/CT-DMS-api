import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
// for migrations

console.log("DATABASE_URI", process.env.DATABASE_URI as string);
const migrationClient = postgres(process.env.DATABASE_URI as string, {
    max: 1,
});

async function main() {
    await migrate(drizzle(migrationClient), {
        migrationsFolder: "./app/infrastructure/database/migrations",
    });

    await migrationClient.end();
}

main();
