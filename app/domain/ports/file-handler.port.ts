import { AppResult } from "@carbonteq/hexapp";
import { UploadFileCommand } from "../types/document.types";

export interface IFileHandler {
    uploadFile(command: UploadFileCommand): Promise<AppResult<boolean>>;
    deleteFile(id: string): Promise<AppResult<boolean>>;
    getFile(id: string): Promise<AppResult<string>>;
}
