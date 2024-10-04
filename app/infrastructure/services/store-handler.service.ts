import { AppResult } from "@carbonteq/hexapp";
import { UploadFileCommand } from "../../domain/types/document.types";
import { IFileStore } from "../../domain/ports/file-store.port";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { CLOUD_FILE_STORE, LOCAL_FILE_STORE } from "../../lib/di/di.tokens";
import { timeout, TimeoutStrategy } from "@carbonteq/resilience";

const timeoutPolicy = timeout(25000, TimeoutStrategy.Aggressive);

@InjectionTarget()
export class FileStoreHandler implements IFileStore {
    constructor(
        @Inject(CLOUD_FILE_STORE) private fileStore: IFileStore,
        @Inject(LOCAL_FILE_STORE) private fileStoreFallback: IFileStore
    ) {}

    async uploadFile(command: UploadFileCommand): Promise<AppResult<boolean>> {
        try {
            return await timeoutPolicy.execute(() =>
                this.fileStore.uploadFile(command)
            );
        } catch (err) {
            return this.fileStoreFallback.uploadFile(command);
        }
    }

    async deleteFile(id: string): Promise<AppResult<boolean>> {
        try {
            return await timeoutPolicy.execute(() =>
                this.fileStore.deleteFile(id)
            );
        } catch (err) {
            return this.fileStoreFallback.deleteFile(id);
        }
    }

    async getFile(id: string): Promise<AppResult<string>> {
        try {
            return await timeoutPolicy.execute(() =>
                this.fileStore.getFile(id)
            );
        } catch (err) {
            return this.fileStoreFallback.getFile(id);
        }
    }
}
