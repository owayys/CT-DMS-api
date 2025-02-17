import { AppError, AppResult } from "@carbonteq/hexapp";
import { AppContext, MiddlewareFunc } from "./types.middleware";

export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

export const restrict = (...roles: UserRole[]): MiddlewareFunc => {
    return (context: AppContext) => {
        const userRole = context.user.userRole as UserRole;

        if (!roles.includes(userRole)) {
            return {
                ...context,
                result: AppResult.Err(
                    AppError.Unauthorized("Permission denied")
                ),
            };
        } else {
            return context;
        }
    };
};
