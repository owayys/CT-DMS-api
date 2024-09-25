import { z } from "zod";

export const DeleteDocumentRequestSchema = z.object({
    id: z.string(),
});
