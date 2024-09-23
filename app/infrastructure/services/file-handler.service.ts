import { IFileHandler } from "../../domain/ports/file-handler.port";
import { stat, unlink } from "fs/promises";
import { FgCyan, FgWhite } from "../../lib/colors";
import { UploadFileCommand } from "../../domain/types/document.types";
import {
    InternalServerError,
    NotFoundException,
} from "../../lib/exceptions/exceptions";
import { AppError, AppResult } from "@carbonteq/hexapp";

export class FileHandlerService implements IFileHandler {
    async uploadFile(command: UploadFileCommand): Promise<AppResult<boolean>> {
        const { id, file } = command;
        try {
            await file.mv(`./app/uploads/${id}`);
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
            await unlink(`./app/uploads/${id}`);
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
            const statCheck = await stat(`./app/uploads/${id}`);
            if (statCheck && statCheck.isFile()) {
                return AppResult.Ok(`./app/uploads/${id}`);
            } else {
                return AppResult.Err(
                    AppError.NotFound(`File [${id}] not found`)
                );
            }
        } catch (err) {
            return AppResult.Err(AppError.NotFound(`File [${id}] not found`));
        }
    }
}
