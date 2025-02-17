import { RequestDTOBase } from "../../lib/api/request.base";
import { AppError, AppResult, DtoValidationError } from "@carbonteq/hexapp";
import { AppContext, MiddlewareFunc } from "./types.middleware";
import { InternalServerError } from "../../lib/exceptions/exceptions";

export const validate = (requestDTO: RequestDTOBase): MiddlewareFunc => {
    return (context: AppContext) => {
        const dto = requestDTO.fromBody(
            context.body,
            context.query,
            context.params
        );
        const validation = dto.validate();

        if (validation.isOk()) {
            context.body = dto;
            return { ...context, result: AppResult.Ok("OK") };
        } else {
            const err: DtoValidationError = validation.unwrapErr();
            if (err instanceof DtoValidationError) {
                const errorMessage = err.message;
                return {
                    ...context,
                    result: AppResult.Err(AppError.InvalidData(errorMessage)),
                };
            } else {
                return {
                    ...context,
                    result: AppResult.Err(new InternalServerError()),
                };
            }
        }
    };
};
