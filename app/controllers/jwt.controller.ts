import { Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { JWT_SERVICE } from "../lib/di/di.tokens";
import { Inject } from "../lib/di/Inject";
import { InjectionTarget } from "../lib/di/InjectionTarget";

declare module "jsonwebtoken" {
    export interface UserNameJWTPayload extends JwtPayload {
        Id: string;
        userName: string;
    }
}

@InjectionTarget()
export class JWTController {
    constructor(@Inject(JWT_SERVICE) private jwtService: any) {}

    generate: RequestHandler = async (req: Request, res: Response, next) => {
        try {
            let { userName, password } = req.body;
            let result = await this.jwtService.generate(userName, password);

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
            console.error(`Error generating JWT`, err.message);
        }
    };

    refresh: RequestHandler = async (req: Request, res: Response, next) => {
        try {
            let refreshToken = req.headers["authorization"];

            let result = await this.jwtService.refresh(refreshToken);

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
            console.error(`Error Refreshing JWT`, err.message);
        }
    };
}
