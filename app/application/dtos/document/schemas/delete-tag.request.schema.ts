import { z } from "zod";

export const DeleteTagRequestSchema = z.object({
    id: z.string().uuid(),
    tag: z.object({ key: z.string(), name: z.string() }),
});
