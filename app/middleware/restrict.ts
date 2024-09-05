export const restrict = (...role: any) => {
    return (req: any, res: any, next: any) => {
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
