import { z } from "zod";

export const AddTagRequestSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
});
