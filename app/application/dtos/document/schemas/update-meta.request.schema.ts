import { z } from "zod";
import { UserDefinedMetadataSchema } from "../../../../lib/validators/document.validators";

export const UpdateMetaRequestSchema = z.object({
    id: z.string().uuid(),
    meta: UserDefinedMetadataSchema,
});
