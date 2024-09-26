import { z } from "zod";

export const GetAllUsersRequestSchema = z.object({
    pageNumber: z.number().positive(),
    pageSize: z.number().positive(),
});
