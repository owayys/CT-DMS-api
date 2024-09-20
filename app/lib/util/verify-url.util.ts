import jwt, { Secret, URLJWTPayload } from "jsonwebtoken";
// import { Result } from "./result";
import {
    ArgumentInvalidException,
    InternalServerError,
} from "../exceptions/exceptions";
import { AppResult } from "@carbonteq/hexapp";

const urlSecret: Secret | undefined = process.env.URL_SECRET;

declare module "jsonwebtoken" {
    export interface URLJWTPayload extends JwtPayload {
        path: string;
        params: { fileName: string; fileExtension: string };
    }
}

export function verifyUrl(url: string): AppResult<URLJWTPayload> {
    if (urlSecret === undefined) {
        return AppResult.Err(new InternalServerError("SECRET_KEY missing"));
    }

    try {
        return AppResult.Ok(jwt.verify(url, urlSecret) as URLJWTPayload);
    } catch (err) {
        return AppResult.Err(
            new ArgumentInvalidException("URL expired or invalid")
        );
    }
}
