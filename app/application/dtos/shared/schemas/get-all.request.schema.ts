import { z } from "zod";

export const GetAllRequestSchema = z.object({
    pageNumber: z.number().positive(),
    pageSize: z.number().positive(),
});
