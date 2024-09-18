import { IRequest, IRequestHandler, IResponse, NextFunction } from "express";

export const restrict: IRequestHandler = (...role: any) => {
    return (req: IRequest, res: IResponse, next: NextFunction) => {
        const userRole = req.user.userRole;

        if (!role.includes(userRole)) {
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
