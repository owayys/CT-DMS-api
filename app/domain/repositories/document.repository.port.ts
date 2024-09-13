import { Result } from "../../lib/util/result";
import { RepositoryPort } from "../../lib/ddd/repository.port";
import { DocumentEntity } from "../entities/document.entity";
import { TagEntity } from "../entities/tag.entity";

export interface IDocumentRepository extends RepositoryPort<DocumentEntity> {
    findByOwner(owner: string): Promise<Result<DocumentEntity[], Error>>;

    addTag(id: string, entity: TagEntity): Promise<Result<TagEntity, Error>>;

    updateTag(id: string, entity: TagEntity): Promise<Result<boolean, Error>>;

    removeTag(id: string, entity: TagEntity): Promise<Result<boolean, Error>>;
}
