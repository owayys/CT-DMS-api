import { z } from "zod";

export const DeleteTagRequestSchema = z.object({
    id: z.string(),
    tag: z.object({ key: z.string(), name: z.string() }),
});
