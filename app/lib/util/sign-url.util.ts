import jwt, { Secret } from "jsonwebtoken";
// import { Result } from "./result";
import { InternalServerError } from "../exceptions/exceptions";
import { AppResult } from "@carbonteq/hexapp";

const urlSecret: Secret | undefined = process.env.URL_SECRET;

export function signUrl(
    path: string,
    params: { fileName: string; fileExtension: string }
): AppResult<string> {
    if (urlSecret === undefined) {
        return AppResult.Err(new InternalServerError("SECRET_KEY missing"));
    }

    return AppResult.Ok(
        jwt.sign({ path, params }, urlSecret, { expiresIn: "15m" })
    );
}
