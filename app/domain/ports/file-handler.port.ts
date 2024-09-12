import { Result } from "../../lib/util/result";
import { UploadFileCommand } from "../types/document.types";

export interface IFileHandler {
    uploadFile(command: UploadFileCommand): Promise<Result<boolean, Error>>;
    deleteFile(id: string): Promise<Result<boolean, Error>>;
    exists(id: string): Promise<Result<boolean, Error>>;
}
