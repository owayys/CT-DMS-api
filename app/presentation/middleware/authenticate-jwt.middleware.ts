import jwt, { Secret } from "jsonwebtoken";

const secretKey: Secret | undefined = process.env.ACCESS_TOKEN_SECRET;

export const authenticateJWT = (req: any, res: any, next: any) => {
    try {
        let accessToken = req.headers["authorization"].split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({
                error: {
                    message: "No Access Token provided",
                },
            });
        }

        if (secretKey === undefined) {
            return res.status(401).json({
                error: {
                    message: `SECRET_KEY missing`,
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
