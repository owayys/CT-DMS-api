import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { LOGGER, USER_SERVICE } from "../../lib/di/di.tokens";
import { ILogger } from "../../lib/logging/ILogger";
import { Services } from "../../application/services/types";
import { GetUserRequestDto } from "../../application/dtos/user/get-user.request.dto";
import { GetAllUsersRequestDto } from "../../application/dtos/user/get-all-users.request.dto";
import { CreateUserRequestDto } from "../../application/dtos/user/create-user.request.dto";
import { retry } from "../../lib/resilience/policies";
import { AppContext, MiddlewareFunc } from "../middleware/types.middleware";
import { AppError, AppResult } from "@carbonteq/hexapp";
import { UserResponseDto } from "../../application/dtos/user/user.response.dto";

const RETRY_ATTEMPTS = 3;

@InjectionTarget()
export class UserController {
    constructor(
        @Inject(USER_SERVICE)
        private userService: Services[typeof USER_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: MiddlewareFunc = async (context: AppContext) => {
        const command: GetUserRequestDto = context.body;

        const userId = command.id;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.userService.get(userId)
        );
        context.result = result;
        return context;
    };

    getAll: MiddlewareFunc = async (context: AppContext) => {
        const command: GetAllUsersRequestDto = context.body;
        const { pageNumber, pageSize } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.userService.getAll(pageNumber, pageSize)
        );
        context.result = result;
        return context;
    };

    register: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext<UserResponseDto>> => {
        const command: CreateUserRequestDto = context.body;
        const { userName, password } = command;
        const result = await this.userService.register(userName, password);
        context.result = result;
        return context;
    };

    update: MiddlewareFunc = async (context: AppContext) => {
        const userId = context.params?.id;

        if (context.user.Id !== userId && context.user.userRole !== "ADMIN") {
            return {
                ...context,
                result: AppResult.Err(
                    AppError.Unauthorized("Invalid User Id for current user")
                ),
            };
        }

        const { password } = context.body;
        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.userService.update(userId, password)
        );
        context.result = result;
        return context;
    };
}
