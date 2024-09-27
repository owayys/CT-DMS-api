import { z } from "zod";

export const AddTagRequestSchema = z.object({
    id: z.string().uuid(),
    tag: z.object({ key: z.string(), name: z.string() }),
});
