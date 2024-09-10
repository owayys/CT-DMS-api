import { UploadedFile } from "express-fileupload";
import { Result } from "../../lib/util/result";
import { RepositoryPort } from "../../lib/ddd/repository.port";
import { DocumentEntity } from "../entities/document.entity";
import { TagEntity } from "../entities/tag.entity";

export interface IDocumentRepository extends RepositoryPort<DocumentEntity> {
    addTag(id: string, entity: TagEntity): Promise<Result<TagEntity, Error>>;

    updateTag(id: string, entity: TagEntity): Promise<Result<TagEntity, Error>>;

    removeTag(id: string, entity: TagEntity): Promise<Result<TagEntity, Error>>;

    // download(link: string): Promise<Result<any, Error>>;

    // upload(
    //     userId: string,
    //     file: UploadedFile,
    //     fileName: string,
    //     fileExtension: string,
    //     contentType: string,
    //     tags: { key: string; name: string }[]
    // ): Promise<Result<any, Error>>;
}
