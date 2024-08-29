import jwt, { GetPublicKeyOrSecret, Secret } from "jsonwebtoken";

const secretKey: Secret | GetPublicKeyOrSecret =
    process.env.ACCESS_TOKEN_SECRET || "ACCESS";

export const authenticateJWT = (req: any, res: any, next: any) => {
    try {
        let accessToken = req.headers["authorization"];

        if (!accessToken) {
            return res.status(401).json({
                error: {
                    message: "No Access Token provided",
                },
            });
        }

        let decoded = jwt.verify(accessToken, secretKey);

        if (typeof decoded != "string") {
            req.user = decoded;
        }

        next();
    } catch (err) {
        res.status(401).json({
            error: {
                message: `Access token expired or invalid`,
            },
        });
    }
};
