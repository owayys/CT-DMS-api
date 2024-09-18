import { IFileHandler } from "../../domain/ports/file-handler.port";
import { Result } from "../../lib/util/result";
import { stat, unlink } from "fs/promises";
import { FgCyan, FgWhite } from "../../lib/colors";
import { UploadFileCommand } from "../../domain/types/document.types";
import {
    InternalServerError,
    NotFoundException,
} from "../../lib/exceptions/exceptions";

export class FileHandlerService implements IFileHandler {
    async uploadFile(
        command: UploadFileCommand
    ): Promise<Result<boolean, Error>> {
        const { id, file } = command;
        try {
            await file.mv(`./app/uploads/${id}`);
            console.log(`Document [${FgCyan}${id}${FgWhite}] was uploaded`);
            return new Result<boolean, Error>(true, null);
        } catch (err) {
            return new Result<boolean, Error>(
                null,
                new InternalServerError(`Error uploading file [${id}]`)
            );
        }
    }

    async deleteFile(id: string): Promise<Result<boolean, Error>> {
        try {
            await unlink(`./app/uploads/${id}`);
            console.log(`Document [${FgCyan}${id}${FgWhite}] was deleted`);
            return new Result<boolean, Error>(true, null);
        } catch (err) {
            return new Result<boolean, Error>(
                null,
                new InternalServerError(`Error deleting file [${id}]`)
            );
        }
    }

    async getFile(id: string): Promise<Result<string, Error>> {
        try {
            const statCheck = await stat(`./app/uploads/${id}`);
            if (statCheck && statCheck.isFile()) {
                return new Result<string, Error>(`./app/uploads/${id}`, null);
            } else {
                return new Result<string, Error>(
                    null,
                    new NotFoundException(`File [${id}] not found`)
                );
            }
        } catch (err) {
            return new Result<string, Error>(
                null,
                new NotFoundException(`File [${id}] not found`)
            );
        }
    }
}
