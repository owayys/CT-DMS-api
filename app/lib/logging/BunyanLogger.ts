import { ILogger } from "./ILogger";
import bunyan from "bunyan";
import { reqSerializer } from "./reqSerializer";
import { FgCyan, FgGreen, FgWhite, FgYellow } from "../colors";
import { Logger } from "drizzle-orm";

export class BunyanLogger implements ILogger, Logger {
    private logger: bunyan;
    constructor() {
        this.logger = bunyan.createLogger({
            name: "BUNYAN",
            serializers: {
                req: reqSerializer,
            },
        });
    }

    log(...args: [any]): void {
        this.logger.info(...args);
    }

    warn(...args: [any]): void {
        this.logger.warn(...args);
    }

    logQuery(query: string, params: unknown[]): void {
        this.logger.info(
            `${FgGreen}DATABASE QUERY${FgWhite}\n${FgCyan}QUERY${FgYellow}`,
            query,
            `\n${FgCyan}PARAMS${FgYellow}`,
            params
        );
    }
}
