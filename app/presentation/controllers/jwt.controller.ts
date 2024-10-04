import { IRequest, IRequestHandler, IResponse, NextFunction } from "express";
import { JWT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";
import { Services } from "../../application/services/types";
import { LoginRequestDto } from "../../application/dtos/auth/login.request.dto";
import { retry } from "../../lib/resilience/policies";

const RETRY_ATTEMPTS = 3;

@InjectionTarget()
export class JWTController {
    constructor(
        @Inject(JWT_SERVICE) private jwtService: Services[typeof JWT_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    generate: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ) => {
        const command: LoginRequestDto = req.body;
        let { userName, password } = command;
        let result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.jwtService.generate(userName, password)
        );

        req.result = result;

        next();
    };

    refresh: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ) => {
        let refreshToken = req.headers["authorization"];

        let result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.jwtService.refresh(refreshToken)
        );

        req.result = result;

        next();
    };
}
