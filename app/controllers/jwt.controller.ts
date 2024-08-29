import { Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { ServiceFactory } from "../services";

const jwtService = new ServiceFactory().createJWTService();

export const generate: RequestHandler = async (
    req: Request,
    res: Response,
    next
) => {
    try {
        let { userName, password } = req.body;
        let result = await jwtService.generate(userName, password);

        if (result instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: result.message,
                },
            });
        } else if ("error" in result) {
            res.status(401).json({
                error: {
                    message: `Access token expired or invalid`,
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error generating JWT`, err.message);
    }
};

declare module "jsonwebtoken" {
    export interface UserNameJWTPayload extends JwtPayload {
        Id: string;
        userName: string;
    }
}

export const refresh: RequestHandler = async (
    req: Request,
    res: Response,
    next
) => {
    try {
        let refreshToken = req.headers["authorization"];

        if (!refreshToken) {
            return res.status(401).json({
                error: {
                    message: "No Refresh Token provided",
                },
            });
        }

        let result = await jwtService.refresh(refreshToken);

        if (result instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: result.message,
                },
            });
        } else if ("error" in result) {
            res.status(401).json({
                error: {
                    message: `Refresh token expired or invalid`,
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error Refreshing JWT`, err.message);
    }
};
