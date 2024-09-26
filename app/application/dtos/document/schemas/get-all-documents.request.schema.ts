import { z } from "zod";
import { UserDefinedMetadataSchema } from "../../../../lib/validators/document.validators";

export const GetAllDocumentsRequestSchema = z.object({
    pageNumber: z.number().positive(),
    pageSize: z.number().positive(),
    filterBy: z
        .object({
            tags: z
                .object({ key: z.string().optional(), name: z.string() })
                .array()
                .optional(),
            meta: UserDefinedMetadataSchema.optional(),
        })
        .optional(),
});
