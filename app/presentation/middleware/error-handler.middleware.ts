import { ZodError } from "zod";
import {
    ArgumentNotProvidedException,
    InternalServerError,
} from "../../lib/exceptions/exceptions";
import { AppError, AppErrStatus, AppResult } from "@carbonteq/hexapp";
import { AppContext, MiddlewareFunc } from "./types.middleware";

export const errorHandler: MiddlewareFunc = (context: AppContext) => {
    const result = context.result! as AppResult<any>;
    if (result.isErr()) {
        const err: AppError = result.unwrapErr();
        let status = null;
        if (err instanceof ArgumentNotProvidedException) {
            status = 400;
        } else if (err.status === AppErrStatus.Unauthorized) {
            status = 401;
        } else if (err.status === AppErrStatus.NotFound) {
            status = 404;
        } else if (err.status === AppErrStatus.AlreadyExists) {
            status = 409;
        } else if (err.status === AppErrStatus.InvalidData) {
            status = 422;
        } else if (err instanceof ZodError) {
            status = 422;
            context.result = AppResult.Err(
                new ZodError(JSON.parse(err.message))
            );
        } else if (err instanceof InternalServerError) {
            status = 500;
        } else {
            status = 400;
        }
        return { ...context, status };
    } else {
        return { ...context, status: 200 };
    }
};
