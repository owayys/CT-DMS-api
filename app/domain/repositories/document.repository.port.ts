import { AppResult } from "@carbonteq/hexapp";
import { RepositoryPort } from "../../lib/ddd/repository.port";
import { DocumentEntity } from "../entities/document.entity";
import { TagEntity } from "../entities/tag.entity";

export interface IDocumentRepository extends RepositoryPort<DocumentEntity> {
    findByOwner(owner: string): Promise<AppResult<DocumentEntity[]>>;

    addTag(id: string, entity: TagEntity): Promise<AppResult<boolean>>;

    updateTag(id: string, entity: TagEntity): Promise<AppResult<boolean>>;

    removeTag(id: string, entity: TagEntity): Promise<AppResult<boolean>>;
}
