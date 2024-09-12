import { NextFunction, Request, Response } from "express";
import { reqSerializer } from "../../lib/logging/reqSerializer";
import { ILogger } from "../../lib/logging/ILogger";
import { Inject } from "../../lib/di/Inject";
import { LOGGER } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";

@InjectionTarget()
export class RequestLogger {
    private logger: ILogger;
    constructor(@Inject(LOGGER) logger?: ILogger) {
        if (!logger) {
            throw Error("No Logger provided");
        }
        this.logger = logger;
    }
    public logRequests = (req: Request, res: Response, next: NextFunction) => {
        const startTime = performance.now();
        next();
        const endTime = performance.now();
        this.logger.log(
            reqSerializer({ req: req, res: res, time: endTime - startTime })
        );
    };
}
