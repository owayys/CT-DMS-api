import jwt, { Secret } from "jsonwebtoken";
import { Result } from "./result";

const urlSecret: Secret | undefined = process.env.URL_SECRET;

export function signUrl(
    path: string,
    params: { fileName: string; fileExtension: string }
): Result<string, Error> {
    if (urlSecret === undefined) {
        return new Result<string, Error>(null, new Error("SECRET_KEY missing"));
    }

    return new Result<string, Error>(
        jwt.sign({ path, params }, urlSecret, { expiresIn: "15m" }),
        null
    );
}
