import { z } from "zod";

export const UpdateDocumentRequestSchema = z.object({
    fileName: z.string(),
    fileExtension: z.string(),
    content: z.string(),
    contentType: z.string(),
    tags: z.object({ key: z.string(), name: z.string() }).array(),
});
