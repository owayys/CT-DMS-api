import { z } from "zod";
import { Result } from "./result";

export const parseResponse = (
    schema:
        | z.ZodObject<any, any>
        | z.ZodArray<z.ZodObject<any, any>>
        | z.ZodUnion<[z.ZodObject<any, any>, z.ZodObject<any, any>]>,
    response: any
): Result<any, Error> => {
    const { data, success, error } = schema.safeParse(response);
    return success
        ? new Result<any, Error>(data, null)
        : new Result<any, Error>(null, error);
};
