import { z } from "zod";

export const DeleteMetaRequestSchema = z.object({
    id: z.string().uuid(),
});
