import { IRequest, IResponse, NextFunction } from "express";

export enum UserRoles {
    ADMIN = "ADMIN",
    USER = "USER",
}

export const restrict = (...roles: UserRoles[]) => {
    return (req: IRequest, res: IResponse, next: NextFunction) => {
        const userRole = req.user.userRole as UserRoles;

        if (!roles.includes(userRole)) {
            res.status(403).json({
                error: {
                    message: "Permission denied",
                },
            });
        } else {
            next();
        }
    };
};
