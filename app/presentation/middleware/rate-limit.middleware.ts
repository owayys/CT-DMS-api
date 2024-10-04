import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";

export const rateLimiter = (opts: {
    windowMs: number;
    limit: number;
    store: Redis;
}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { windowMs, limit, store } = opts;
        if (await store.setnx(req.ip!, limit)) {
            store.expire(req.ip!, windowMs);
        }
        let bucket = await store.get(req.ip!);

        if (bucket && parseInt(bucket) > 0) {
            store.decrby(req.ip!, 1);
            next();
        } else {
            res.status(429).json({
                error: {
                    message: "Rate limit exceeded",
                },
            });
        }
    };
};
