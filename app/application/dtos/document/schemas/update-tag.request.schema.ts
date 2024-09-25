import { z } from "zod";

export const UpdateTagRequestSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
});
