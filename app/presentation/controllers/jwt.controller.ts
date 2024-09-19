import { IRequest, IRequestHandler, IResponse, NextFunction } from "express";
import { JWT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";
import { Services } from "../types";

@InjectionTarget()
export class JWTController {
    constructor(
        @Inject(JWT_SERVICE) private jwtService: Services[typeof JWT_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    generate: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        let { userName, password } = req.body;
        let result = await this.jwtService.generate(userName, password);

        req.result = result;

        next();
    };

    refresh: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        let refreshToken = req.headers["authorization"];

        let result = await this.jwtService.refresh(refreshToken);

        req.result = result;

        next();
    };
}
