import { z } from "zod";

export const UpdateUserRequestSchema = z.object({
    id: z.string(),
    password: z.string(),
});
