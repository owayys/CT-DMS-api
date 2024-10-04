import { z } from "zod";

export const GetDocumentRequestSchema = z.object({
    id: z.string().uuid(),
});
