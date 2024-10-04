import { z } from "zod";

export const GetDocumentContentRequestSchema = z.object({
    id: z.string().uuid(),
});
