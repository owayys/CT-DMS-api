import { IFileHandler } from "../../domain/ports/file-handler.port";
import { Result } from "../../lib/util/result";
import { stat, unlink } from "fs/promises";
import { FgCyan, FgWhite } from "../../lib/colors";
import { UploadFileCommand } from "../../domain/types/document.types";

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
                new Error(`Error uploading file [${id}]`)
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
                new Error(`Error deleting file [${id}]`)
            );
        }
    }

    async exists(id: string): Promise<Result<boolean, Error>> {
        try {
            const statCheck = await stat(`./app/uploads/${id}`);
            if (statCheck && statCheck.isFile()) {
                return new Result<boolean, Error>(true, null);
            } else {
                return new Result<boolean, Error>(false, null);
            }
        } catch (err) {
            return new Result<boolean, Error>(false, null);
        }
    }
}
