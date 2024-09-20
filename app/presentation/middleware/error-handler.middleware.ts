import { IRequest, IRequestHandler, IResponse, NextFunction } from "express";
import { ZodError } from "zod";
import {
    ArgumentInvalidException,
    ArgumentNotProvidedException,
    ConflictException,
    InternalServerError,
    NotFoundException,
} from "../../lib/exceptions/exceptions";
import { AppResult } from "@carbonteq/hexapp";

export const errorHandler: IRequestHandler = (
    req: IRequest,
    res: IResponse,
    next: NextFunction
) => {
    const result = req.result! as AppResult<any>;
    if (result.isErr()) {
        const err: Error = result.unwrapErr();
        if (err instanceof ArgumentNotProvidedException) {
            res.status(400).json({
                error: {
                    message: err.message,
                },
            });
        } else if (err instanceof NotFoundException) {
            res.status(404).json({
                error: {
                    message: err.message,
                },
            });
        } else if (err instanceof ConflictException) {
            res.status(409).json({
                error: {
                    message: err.message,
                },
            });
        } else if (err instanceof ArgumentInvalidException) {
            res.status(422).json({
                error: {
                    message: err.message,
                },
            });
        } else if (err instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: JSON.parse(err.message),
                },
            });
        } else if (err instanceof InternalServerError) {
            res.status(500).json({
                error: {
                    message: err.message,
                },
            });
        }
    } else {
        res.status(200).json(result.unwrap());
    }
};
