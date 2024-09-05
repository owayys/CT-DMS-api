import { ILogger } from "./ILogger";
import bunyan from "bunyan";
import { reqSerializer } from "./reqSerializer";

export class BunyanLogger implements ILogger {
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
}
