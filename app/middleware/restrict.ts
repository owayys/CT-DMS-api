export const restrict = (...role: any) => {
    return (req: any, res: any, next: any) => {
        const userRole = req.user.userRole;

        if (!role.includes(userRole)) {
            res.status(401).json({
                error: {
                    message: "Permission denied",
                },
            });
        }

        next();
    };
};
