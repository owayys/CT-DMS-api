import { IRequest, IResponse, NextFunction } from "express";

export const restrict = (...role: any) => {
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
