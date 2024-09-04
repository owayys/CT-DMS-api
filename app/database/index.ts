import "dotenv/config";
import postgres from "postgres";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";

export class DrizzleClientWrapper {
    constructor() {
        const client = postgres(process.env.DATABASE_URI as string);
        return drizzle(client, { schema, logger: true });
    }
}
