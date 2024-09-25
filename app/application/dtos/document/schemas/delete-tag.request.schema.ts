import { z } from "zod";

export const DeleteTagRequestSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
});
