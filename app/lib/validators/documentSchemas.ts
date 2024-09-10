import { z } from "zod";

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

// const jsonSchema = z
//     .string()
//     .refine((value) => {
//         try {
//             JSON.parse(value);
//             return true;
//         } catch (_) {
//             return false;
//         }
//     })
//     .transform((value) => JSON.parse(value));

// const stringToJSONSchema = z
//     .string()
//     .transform((str, ctx): z.infer<ReturnType<typeof json>> => {
//         try {
//             return JSON.parse(str);
//         } catch (e) {
//             ctx.addIssue({ code: "custom", message: "Invalid JSON" });
//             return z.NEVER;
//         }
//     });

// const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

// type Literal = z.infer<typeof literalSchema>;

// type Json = Literal | { [key: string]: Json } | Json[];

// const jsonSchema: z.ZodType<Json> = z.lazy(() =>
//     z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
// );

// const json = () => jsonSchema;

// const stringToJSONSchema = z
//     .object()
//     .transform((str, ctx): z.infer<ReturnType<typeof json>> => {
//         try {
//             console.log(str);
//             return JSON.parse(str);
//         } catch (e) {
//             console.log(e);
//             ctx.addIssue({ code: "custom", message: "Invalid JSON" });
//             return z.NEVER;
//         }
//     });

export const Document = z.object({
    userId: z.string().uuid(),
    Id: z.string().uuid(),
    fileName: z.string(),
    fileExtension: z.string(),
    content: z.string(),
    contentType: z.string(),
    meta: z.record(z.string(), z.any()).nullable(),
    tags: Tag.pick({ key: true, name: true }).array(),
    // createdAt: z.coerce.date(),
    // updatedAt: z.coerce.date(),
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
    body: Tag,
});

export const UpdateTag = AddTag;

export const DeleteTag = AddTag;

export const TagResponse = Tag;

export const DocumentResponse = z.object({
    page: z.number(),
    size: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    items: Document.array(),
});
