import jwt, { Secret, UserJWTPayload } from "jsonwebtoken";
import { AppContext, MiddlewareFunc } from "./types.middleware";
import { AppError, AppResult } from "@carbonteq/hexapp";
import { InternalServerError } from "../../lib/exceptions/exceptions";

const secretKey: Secret | undefined = process.env.ACCESS_TOKEN_SECRET;

export const authenticateJWT: MiddlewareFunc = (context: AppContext) => {
    try {
        let accessToken = context.headers?.["authorization"].split(" ")[1];

        if (!accessToken) {
            return {
                ...context,
                result: AppResult.Err(
                    AppError.Unauthorized("No access token provided")
                ),
            } as AppContext;
        }

        if (secretKey === undefined) {
            return {
                ...context,
                result: AppResult.Err(
                    new InternalServerError("SECRET_KEY missing")
                ),
            } as AppContext;
        }

        let decoded = jwt.verify(accessToken, secretKey);

        if (typeof decoded != "string") {
            context.user = decoded as UserJWTPayload;
            return { ...context, result: AppResult.Ok("OK") } as AppContext;
        }

        return {
            ...context,
            result: AppResult.Err(
                new InternalServerError("Error validating access token")
            ),
        } as AppContext;
    } catch (err) {
        return {
            ...context,
            result: AppResult.Err(
                AppError.Unauthorized("Access token expired or invalid")
            ),
        } as AppContext;
    }
};
