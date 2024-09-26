import { z } from "zod";

export const TagEntitySchema = z.object({
    key: z.string(),
    name: z.string(),
});
