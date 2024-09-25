import { z } from "zod";
import { UserDefinedMetadata } from "../../types/document.types";
import { TagEntitySchema } from "./tag.schema";

export const CONTENT_TYPES = [
    "image/png",
    "image/gif",
    "application/pdf",
    "audio/mpeg",
    "video/mp4",
    "text/plain",
];

export const FILE_EXTENSIONS = [".png", ".gif", ".pdf", ".mp3", ".mp4", ".txt"];

const PrimitiveSchema = z.union([z.string(), z.number(), z.boolean()]);

const UserDefinedMetadataSchema: z.ZodSchema<UserDefinedMetadata> = z.lazy(() =>
    z.record(
        z.union([
            PrimitiveSchema,
            PrimitiveSchema.array(),
            UserDefinedMetadataSchema,
            RecursiveNestedArray,
        ])
    )
);

const RecursiveNestedArray: any = z.lazy(() =>
    z.array(
        z.union([
            UserDefinedMetadataSchema,
            PrimitiveSchema,
            PrimitiveSchema.array(),
            RecursiveNestedArray,
        ])
    )
);

export const DocumentEntitySchema = z.object({
    ownerId: z.string().uuid(),
    fileName: z.string(),
    fileExtension: z.enum(FILE_EXTENSIONS as [string]),
    content: z.string(),
    contentType: z.enum(CONTENT_TYPES as [string]),
    tags: TagEntitySchema.array(),
    meta: UserDefinedMetadataSchema.optional(),
});
