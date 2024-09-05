import postgres from "postgres";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { Logger } from "drizzle-orm";
import { Inject } from "../lib/di/Inject";
import { LOGGER } from "../lib/di/di.tokens";
import { InjectionTarget } from "../lib/di/InjectionTarget";

@InjectionTarget()
export class DrizzleClientWrapper {
    private logger: Logger;
    constructor(@Inject(LOGGER) logger?: Logger | any) {
        if (!logger) {
            throw Error("Logger not provided");
        }
        this.logger = logger;
        return this.getClient();
    }

    getClient() {
        const client = postgres(process.env.DATABASE_URI as string);
        return drizzle(client, { schema, logger: this.logger }) as any;
    }
}
