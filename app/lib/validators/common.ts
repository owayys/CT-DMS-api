import { UploadedFile } from "express-fileupload";
import { z } from "zod";

export const UploadedFileSchema = z.object({
    name: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    data: z.instanceof(Buffer),
    tempFilePath: z.string(),
    truncated: z.boolean(),
    size: z.number(),
    md5: z.string(),
    mv: z.function().args(z.string()).returns(z.promise(z.void())),
}) satisfies z.ZodType<UploadedFile>;

export const BaseResponse = z.object({
    Id: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const UpdateResponse = z.object({
    success: z.boolean(),
});

export const ErrorResponse = z.object({
    error: z.object({ message: z.string() }),
});

export const DeleteResponse = UpdateResponse;
