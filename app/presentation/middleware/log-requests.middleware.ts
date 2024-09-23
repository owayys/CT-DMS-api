import { NextFunction, Request, Response } from "express";
import { reqSerializer } from "../../lib/logging/reqSerializer";
import { ILogger } from "../../lib/logging/ILogger";
import { Inject } from "../../lib/di/Inject";
import { LOGGER } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Logger } from "@carbonteq/hexapp";

@InjectionTarget()
export class RequestLogger {
    private logger: Logger;
    constructor(@Inject(LOGGER) logger?: Logger) {
        if (!logger) {
            throw Error("No Logger provided");
        }
        this.logger = logger;
    }
    public logRequests = (req: Request, res: Response, next: NextFunction) => {
        const startTime = performance.now();
        next();
        const endTime = performance.now();
        this.logger.info(
            reqSerializer({ req: req, res: res, time: endTime - startTime })
        );
    };
}
