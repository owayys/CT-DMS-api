import { z } from "zod";

export const GetUserRequestSchema = z.object({
    id: z.string(),
});
