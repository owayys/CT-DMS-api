import { NextFunction, IResponse, IRequest, IRequestHandler } from "express";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { LOGGER, USER_SERVICE } from "../../lib/di/di.tokens";
import { ILogger } from "../../lib/logging/ILogger";
import { Services } from "../../application/services/types";
import { GetUserRequestDto } from "../../application/dtos/user/get-user.request.dto";
import { GetAllUsersRequestDto } from "../../application/dtos/user/get-all-users.request.dto";
import { CreateUserRequestDto } from "../../application/dtos/user/create-user.request.dto";
import { retry } from "../../lib/resilience/policies";

const RETRY_ATTEMPTS = 3;

@InjectionTarget()
export class UserController {
    constructor(
        @Inject(USER_SERVICE)
        private userService: Services[typeof USER_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ) => {
        const command: GetUserRequestDto = req.body;

        const userId = command.id;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.userService.get(userId)
        );

        req.result = result;

        next();
    };

    getAll: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ) => {
        const command: GetAllUsersRequestDto = req.body;
        const { pageNumber, pageSize } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.userService.getAll(pageNumber, pageSize)
        );

        req.result = result;

        next();
    };

    register: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ) => {
        const command: CreateUserRequestDto = req.body;
        const { userName, password } = command;
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

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.userService.update(userId, password)
        );

        req.result = result;

        next();
    };
}
