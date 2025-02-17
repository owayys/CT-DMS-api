import { oc } from "@orpc/contract";
import { z } from "zod";
import {
    BaseResponse,
    ErrorResponse,
    UploadedFileSchema,
} from "../../lib/validators/common";
import { GetDocumentRequestSchema } from "../../application/dtos/document/schemas/get-document.request.schema";
import { DocumentResponseSchema } from "../../application/dtos/document/schemas/document.response.schema";
import { CreateDocumentRequestSchema } from "../../application/dtos/document/schemas/create-document.request.schema";
import { GetAllDocumentsRequestSchema } from "../../application/dtos/document/schemas/get-all-documents.request.schema";
import { GetDocumentResponse } from "../../lib/validators/document.validators";

export const documentContract = oc.prefix("/document").router({
    upload: oc
        .route({
            method: "POST",
            path: "/upload",
            summary: "Upload a new document",
        })
        .input(
            CreateDocumentRequestSchema.pick({ tags: true }).merge(
                z.object({ file: z.instanceof(File) })
            )
        )
        .output(BaseResponse.merge(GetDocumentResponse).or(ErrorResponse)),
    get: oc
        .route({
            method: "GET",
            path: "/:id",
            summary: "Get a document by ID",
        })
        .input(GetDocumentRequestSchema)
        .output(BaseResponse.merge(DocumentResponseSchema).or(ErrorResponse)),
    getAll: oc
        .route({
            method: "GET",
            path: "/",
            summary: "Get all documents (Paginated)",
        })
        .route({})
        .input(GetAllDocumentsRequestSchema)
        .output(z.any()),
});
