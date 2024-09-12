import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { FILE_HANDLER } from "../../lib/di/di.tokens";
import { Result } from "../../lib/util/result";
import { IFileHandler } from "../ports/file-handler.port";
import { UploadFileCommand } from "../types/document.types";

@InjectionTarget()
export class UploadDocumentService {
    constructor(@Inject(FILE_HANDLER) private fileHandler: IFileHandler) {}
    async execute(command: UploadFileCommand): Promise<Result<boolean, Error>> {
        return await this.fileHandler.uploadFile(command);
    }
}
