import { NextFunction, IResponse, IRequest, IRequestHandler } from "express";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { LOGGER, USER_SERVICE } from "../../lib/di/di.tokens";
import { ILogger } from "../../lib/logging/ILogger";
import { Services } from "../../application/services/types";

@InjectionTarget()
export class UserController {
    constructor(
        @Inject(USER_SERVICE)
        private userService: Services[typeof USER_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        const userId = req.params.id;

        const result = await this.userService.get(userId);

        req.result = result;

        next();
    };

    getAll = async (req: IRequest, res: IResponse, next: NextFunction) => {
        const { pageNumber, pageSize } = req.query;

        const result = await this.userService.getAll(
            pageNumber as unknown as number,
            pageSize as unknown as number
        );

        req.result = result;

        next();
    };

    register: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        const { userName, password } = req.body;
        const result = await this.userService.register(userName, password);
        req.result = result;
        next();
    };

    update: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
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
    };
}
