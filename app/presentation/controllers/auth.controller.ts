import { AUTH_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";
import { Services } from "../../application/services/types";
import { LoginRequestDto } from "../../application/dtos/auth/login.request.dto";
import { retry } from "../../lib/resilience/policies";
import { AppContext, MiddlewareFunc } from "../middleware/types.middleware";

const RETRY_ATTEMPTS = 3;

@InjectionTarget()
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE) private jwtService: Services[typeof AUTH_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    generate: MiddlewareFunc = async (context: AppContext) => {
        const command: LoginRequestDto = context.body;
        let { userName, password } = command;
        let result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.jwtService.generate(userName, password)
        );

        context.result = result;

        return context;
    };

    refresh: MiddlewareFunc = async (context: AppContext) => {
        let refreshToken = context.headers?.["authorization"];

        let result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.jwtService.refresh(refreshToken)
        );

        context.result = result;

        return context;
    };
}
