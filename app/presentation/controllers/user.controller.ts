import { Request, Response, RequestHandler, NextFunction } from "express";
import { ZodError } from "zod";
// import { InjectionTarget } from "../lib/di/InjectionTarget";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
// import { Inject } from "../lib/di/Inject";
import { Inject } from "../../lib/di/Inject";
// import { LOGGER, USER_SERVICE } from "../lib/di/di.tokens";
import { LOGGER, USER_SERVICE } from "../../lib/di/di.tokens";
// import { ILogger } from "../lib/logging/ILogger";
import { ILogger } from "../../lib/logging/ILogger";

@InjectionTarget()
export class UserController {
    constructor(
        @Inject(USER_SERVICE) private userService: any,
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.params.id;

            const result = await this.userService.get(userId);

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(422).json({
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
            const { pageNumber, pageSize } = req.query;

            const result = await this.userService.getAll(
                (pageNumber as unknown as number) - 1,
                pageSize as unknown as number
            );

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(422).json({
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

    register: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userName, password } = req.body;
            const result = await this.userService.register(userName, password);
            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(422).json({
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
        req: any,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.params.id;

            if (req.user.Id !== userId && req.user.userRole !== "ADMIN") {
                return res.status(403).json({
                    err: {
                        message: "Invalid User Id for current user",
                    },
                });
            }

            const { password } = req.body;

            const result = await this.userService.update(userId, password);

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(422).json({
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
