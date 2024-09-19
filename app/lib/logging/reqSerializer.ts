import { Request, Response } from "express";
import {
    FgBlue,
    FgCyan,
    FgGreen,
    FgMagenta,
    FgRed,
    FgWhite,
    FgYellow,
} from "../colors";

export const reqSerializer = ({
    req,
    res,
    time,
}: {
    req: Request;
    res: Response;
    time: number;
}) => {
    const method = req.method;
    const methodColor =
        method == "GET"
            ? FgBlue
            : method == "POST"
            ? FgGreen
            : method == "PUT"
            ? FgYellow
            : method == "DELETE"
            ? FgRed
            : FgWhite;
    const statusCode = res.statusCode;
    const codeColor =
        statusCode >= 500
            ? FgRed
            : statusCode >= 400
            ? FgYellow
            : statusCode >= 300
            ? FgCyan
            : statusCode >= 200
            ? FgGreen
            : FgWhite;

    return `${methodColor}${req.method}${FgMagenta} ${truncate(
        req.originalUrl,
        100
    )} ${codeColor}${statusCode} ${FgWhite}${time.toFixed(3)} ms`;
};

function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) + "..." : str;
}
