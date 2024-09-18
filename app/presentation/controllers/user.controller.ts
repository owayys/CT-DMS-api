import { NextFunction, IResponse, IRequest, IRequestHandler } from "express";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { LOGGER, USER_SERVICE } from "../../lib/di/di.tokens";
import { ILogger } from "../../lib/logging/ILogger";

@InjectionTarget()
export class UserController {
    constructor(
        @Inject(USER_SERVICE) private userService: any,
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        try {
            const userId = req.params.id;

            const result = await this.userService.get(userId);

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    getAll = async (req: IRequest, res: IResponse, next: NextFunction) => {
        try {
            const { pageNumber, pageSize } = req.query;

            const result = await this.userService.getAll(
                (pageNumber as unknown as number) - 1,
                pageSize as unknown as number
            );

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    register: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        try {
            const { userName, password } = req.body;
            const result = await this.userService.register(userName, password);
            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    update: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
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

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };
}
