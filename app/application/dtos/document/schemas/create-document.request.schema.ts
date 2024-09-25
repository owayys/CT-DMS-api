import { z } from "zod";
import { UserDefinedMetadataSchema } from "../../../../lib/validators/document.validators";

export const CreateDocumentRequestSchema = z.object({
    fileName: z.string(),
    fileExtension: z.string(),
    content: z.string(),
    contentType: z.string(),
    meta: UserDefinedMetadataSchema.optional(),
    tags: z.object({ key: z.string(), name: z.string() }).array(),
});
