import { z } from "zod";
// import { Result } from "./result";
import { AppResult } from "@carbonteq/hexapp";

export function parseResponse<T>(
    schema:
        | z.ZodObject<any, any>
        | z.ZodArray<z.ZodObject<any, any>>
        | z.ZodUnion<[z.ZodObject<any, any>, z.ZodObject<any, any>]>,
    response: T
): AppResult<T> {
    const { data, success, error } = schema.safeParse(response);
    return success ? AppResult.Ok(data as T) : AppResult.Err(error);
}
