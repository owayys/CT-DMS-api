import { Request, Response, RequestHandler, NextFunction } from "express";
import { ZodError } from "zod";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { Inject } from "../lib/di/Inject";
import { LOGGER, USER_SERVICE } from "../lib/di/di.tokens";
import { ILogger } from "../lib/logging/ILogger";

type ReqDictionary = {};
type ReqBody = { foo1?: string };
type ResBody = { foo2?: string };
type ReqQuery = { pageNumber: number; pageSize: number };

@InjectionTarget()
export class UserController {
    constructor(
        @Inject(USER_SERVICE) private userService: any,
        @Inject(LOGGER) private logger: ILogger | any
    ) {}

    get: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let userId = req.params.id;

            let result = await this.userService.get(userId);

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
                        error: {
                            message: JSON.parse(err.message),
                        },
                    });
                } else {
                    res.status(404).json({
                        error: {
                            message: err.message,
                        },
                    });
                }
            } else {
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { pageNumber, pageSize } = req.query;

            let result = await this.userService.getAll(
                (pageNumber as unknown as number) - 1,
                pageSize as unknown as number
            );

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
                        error: {
                            message: JSON.parse(err.message),
                        },
                    });
                } else {
                    res.status(404).json({
                        error: {
                            message: err.message,
                        },
                    });
                }
            } else {
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    save: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let { userName, password } = req.body;
            let result = await this.userService.save(userName, password);
            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
                        error: {
                            message: JSON.parse(err.message),
                        },
                    });
                } else {
                    res.status(404).json({
                        error: {
                            message: err.message,
                        },
                    });
                }
            } else {
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    update: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let userId = req.params.id;
            let { password } = req.body;
            let result = await this.userService.update(userId, password);
            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
                        error: {
                            message: JSON.parse(err.message),
                        },
                    });
                } else {
                    res.status(404).json({
                        error: {
                            message: err.message,
                        },
                    });
                }
            } else {
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };
}
