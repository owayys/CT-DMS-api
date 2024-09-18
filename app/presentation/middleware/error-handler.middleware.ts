import { IRequest, IRequestHandler, IResponse, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler: IRequestHandler = (
    req: IRequest,
    res: IResponse,
    next: NextFunction
) => {
    const result = req.result!;
    if (result.isErr()) {
        const err: Error = result.getErr();

        if (err instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: JSON.parse(err.message),
                },
            });
        } else {
            res.status(404).json({
                error: {
                    message: err.message,
                },
            });
        }
    } else {
        res.status(200).json(result.unwrap());
    }
};
