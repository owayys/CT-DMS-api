import { z } from "zod";

export const TagResponseSchema = z.object({
    key: z.string(),
    name: z.string(),
});
