import { IRequest, IRequestHandler, IResponse, NextFunction } from "express";
import { JWT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";

@InjectionTarget()
export class JWTController {
    constructor(
        @Inject(JWT_SERVICE) private jwtService: any,
        @Inject(LOGGER) private logger: ILogger
    ) {}

    generate: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        try {
            let { userName, password } = req.body;
            let result = await this.jwtService.generate(userName, password);

            req.result = result;

            next();
        } catch (err) {
            console.error(`Error generating JWT`, err.message);
        }
    };

    refresh: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ) => {
        try {
            let refreshToken = req.headers["authorization"];

            let result = await this.jwtService.refresh(refreshToken);

            req.result = result;

            next();
        } catch (err) {
            console.error(`Error Refreshing JWT`, err.message);
        }
    };
}
