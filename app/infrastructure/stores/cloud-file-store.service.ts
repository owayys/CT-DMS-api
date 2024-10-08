import { AppError, AppResult } from "@carbonteq/hexapp";
import { IFileStore } from "../../domain/ports/file-store.port";
import { UploadFileCommand } from "../../domain/types/document.types";
import { Bucket, Storage } from "@google-cloud/storage";
import { FgCyan, FgWhite } from "../../lib/colors";
import { InternalServerError } from "../../lib/exceptions/exceptions";

export class CloudFileStore implements IFileStore {
    private bucket: Bucket;
    constructor() {
        this.bucket = new Storage({
            projectId: "ct-dms",
            keyFilename: process.env.GCLOUD_KEYFILE,
        }).bucket(process.env.GCLOUD_BUCKET!);
    }

    async uploadFile(command: UploadFileCommand): Promise<AppResult<boolean>> {
        console.log("Used cloud upload");
        const { id, file } = command;
        try {
            await this.bucket.file(id).save(file.data);
            await this.bucket.file(id).setMetadata({
                contentType: file.mimetype,
                contentDisposition: file.name,
            });

            console.log(`Document [${FgCyan}${id}${FgWhite}] was uploaded`);
            return AppResult.Ok(true);
        } catch (err) {
            return AppResult.Err(
                new InternalServerError(`Error uploading file [${id}]`)
            );
        }
    }

    async deleteFile(id: string): Promise<AppResult<boolean>> {
        try {
            await this.bucket.file(id).delete();

            console.log(`Document [${FgCyan}${id}${FgWhite}] was deleted`);
            return AppResult.Ok(true);
        } catch (err) {
            return AppResult.Err(
                new InternalServerError(`Error deleting file [${id}]`)
            );
        }
    }

    async getFile(id: string): Promise<AppResult<string>> {
        try {
            const file = this.bucket.file(id);
            const [url] = await file.getSignedUrl({
                action: "read",
                expires: Date.now() + 1000 * 60 * 60,
            });
            return AppResult.Ok(url);
        } catch (err) {
            return AppResult.Err(AppError.NotFound(`File [${id}] not found`));
        }
    }
}
