import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { FILE_HANDLER } from "../../lib/di/di.tokens";
import { Result } from "../../lib/util/result";
import { IFileHandler } from "../ports/file-handler.port";

@InjectionTarget()
export class DeleteDocumentService {
    constructor(@Inject(FILE_HANDLER) private fileHandler: IFileHandler) {}
    async execute(id: string): Promise<Result<boolean, Error>> {
        return await this.fileHandler.deleteFile(id);
    }
}
