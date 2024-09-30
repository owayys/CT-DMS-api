import { NextFunction, Request, Response } from "express";
import { RequestDTOBase } from "../../lib/api/request.base";
import { DtoValidationError } from "@carbonteq/hexapp";

export const validate = (requestDTO: RequestDTOBase) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const dto = requestDTO.fromBody(req.body, req.query, req.params);
        const validation = dto.validate();

        if (validation.isOk()) {
            req.body = dto;
            next();
        } else {
            const err: DtoValidationError = validation.unwrapErr();
            if (err instanceof DtoValidationError) {
                const errorMessage = err.message;
                res.status(422).json({
                    error: "Invalid data",
                    details: errorMessage,
                });
            } else {
                res.status(500).json({
                    error: "Internal Server Error",
                });
            }
        }
    };
};
