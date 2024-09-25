import { z } from "zod";
import { UserDefinedMetadata } from "../../domain/types/document.types";

export const Tag = z.object({
    key: z.string({
        required_error: "Tag Key is required",
    }),
    name: z.string({
        required_error: "Tag Name is required",
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const PrimitiveSchema = z.union([z.string(), z.number(), z.boolean()]);

export const UserDefinedMetadataSchema: z.ZodSchema<UserDefinedMetadata> =
    z.lazy(() =>
        z.record(
            z.union([
                PrimitiveSchema,
                PrimitiveSchema.array(),
                UserDefinedMetadataSchema,
                RecursiveNestedArray,
            ])
        )
    );

export const RecursiveNestedArray: any = z.lazy(() =>
    z.array(
        z.union([
            UserDefinedMetadataSchema,
            PrimitiveSchema,
            PrimitiveSchema.array(),
            RecursiveNestedArray,
        ])
    )
);

export const Document = z.object({
    userId: z.string().uuid(),
    Id: z.string().uuid(),
    fileName: z.string(),
    fileExtension: z.string(),
    content: z.string(),
    contentType: z.string(),
    meta: UserDefinedMetadataSchema.optional(),
    tags: Tag.pick({ key: true, name: true }).array(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const GetDocumentResponse = Document;

export const GetDocumentContent = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const GetDocument = GetDocumentContent;

export const DeleteDocument = GetDocumentContent;

export const SaveDocumentResponse = Document;

export const SaveDocument = z.object({
    body: Document.pick({
        fileName: true,
        fileExtension: true,
        contentType: true,
        tags: true,
        meta: true,
    }).extend({
        content: z.string(),
    }),
});

export const UpdateDocument = z.object({
    params: z.object({
        id: z
            .string({
                required_error: "Document ID is required",
            })
            .uuid(),
    }),
    body: Document.pick({
        fileName: true,
        fileExtension: true,
        contentType: true,
        tags: true,
    }).extend({
        content: z.string(),
    }),
});

export const GetAllDocuments = z.object({
    query: z.object({
        pageNumber: z.coerce
            .number()
            .min(1, "Page Number must be 1 or greater")
            .optional(),
        pageSize: z.coerce
            .number()
            .min(1, "Page Number must be 1 or greater")
            .optional(),
        tag: z.string().optional(),
    }),
});

export const DocumentContentResponse = z.union([
    z.object({
        downloadUrl: z.string(),
        isBase64: z.boolean(),
    }),
    z.object({
        content: z.string().nullable(),
    }),
]);

export const AddTag = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: Tag.pick({ key: true, name: true }),
});

export const UpdateTag = AddTag;

export const DeleteTag = AddTag;

export const DocumentResponse = z.object({
    pageNum: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    data: Document.array(),
});
