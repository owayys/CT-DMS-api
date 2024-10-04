import { ILogger } from "./ILogger";
import bunyan from "bunyan";
import { reqSerializer } from "./reqSerializer";
import { FgCyan, FgGreen, FgWhite, FgYellow } from "../colors";
// import { Logger } from "drizzle-orm";
import { Logger, LogLevel } from "@carbonteq/hexapp";

export class BunyanLogger extends Logger implements ILogger {
    private logger: bunyan;
    constructor() {
        super();
        this.logger = bunyan.createLogger({
            name: "BUNYAN",
            serializers: {
                req: reqSerializer,
            },
        });
    }

    log(...args: [unknown]): void {
        this.logger.info(...args);
    }

    info(...args: [unknown]): void {
        this.logger.info(...args);
    }

    warn(...args: [unknown]): void {
        this.logger.warn(...args);
    }

    logQuery(query: string, params: unknown[]): void {
        this.logger.info(
            `${FgGreen}DATABASE QUERY [ ${FgWhite}\n${FgCyan}QUERY${FgYellow}`,
            query,
            `\n${FgCyan}PARAMS${FgYellow}`,
            params,
            `${FgGreen} ]${FgWhite}`
        );
    }

    error(...args: unknown[]): void {
        this.logger.warn(args);
    }

    debug(...args: unknown[]): void {
        this.logger.debug(args);
    }

    setContext(ctx: string): void {}
    setLevel(lvl: LogLevel): void {}
}
