import jwt, { Secret, URLJWTPayload } from "jsonwebtoken";
import { Result } from "./result";

const urlSecret: Secret | undefined = process.env.URL_SECRET;

declare module "jsonwebtoken" {
    export interface URLJWTPayload extends JwtPayload {
        path: string;
        params: { fileName: string; fileExtension: string };
    }
}

export function verifyUrl(url: string): Result<URLJWTPayload, Error> {
    if (urlSecret === undefined) {
        return new Result<URLJWTPayload, Error>(
            null,
            new Error("SECRET_KEY missing")
        );
    }

    try {
        return new Result<URLJWTPayload, Error>(
            jwt.verify(url, urlSecret) as URLJWTPayload,
            null
        );
    } catch (err) {
        return new Result<URLJWTPayload, Error>(
            null,
            new Error("URL expired or invalid")
        );
    }
}
