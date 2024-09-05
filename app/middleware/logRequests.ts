import { NextFunction, Request, Response } from "express";
import { BunyanLogger } from "../lib/logging/BunyanLogger";
import { reqSerializer } from "../lib/logging/reqSerializer";

const logger = new BunyanLogger();

export const logRequests = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startTime = performance.now();
    next();
    const endTime = performance.now();
    logger.log(
        reqSerializer({ req: req, res: res, time: endTime - startTime })
    );
};
