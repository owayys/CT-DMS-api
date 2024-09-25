import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { RequestDTOBase } from "../../lib/api/request.base";
import { DtoValidationError } from "@carbonteq/hexapp";

export const validate = (requestDTO: RequestDTOBase) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const dto = requestDTO.fromBody(req.body, req.query, req.params);
        console.log(dto);
        const validation = dto.validate();

        if (validation.isOk()) {
            req.body = dto;
            next();
        } else {
            const err: DtoValidationError = validation.unwrapErr();
            console.log(err);
            if (err instanceof ZodError) {
                const errorMessages = err.errors.map((issue: any) => ({
                    message: `${issue.message}`,
                }));
                res.status(422).json({
                    error: "Invalid data",
                    details: errorMessages,
                });
            } else {
                res.status(500).json({
                    error: "Internal Server Error",
                });
            }
        }
    };
};
