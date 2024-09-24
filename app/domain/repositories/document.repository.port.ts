import {
    AppResult,
    BaseRepository,
    NotFoundError,
    Paginated,
    PaginationOptions,
    RepositoryResult,
} from "@carbonteq/hexapp";
import { DocumentEntity } from "../entities/document/document.entity";
import { TagEntity } from "../entities/document/tag.entity";

export interface IDocumentRepository extends BaseRepository<DocumentEntity> {
    findByOwner(owner: string): Promise<AppResult<DocumentEntity[]>>;
    findOneById(
        id: string
    ): Promise<RepositoryResult<DocumentEntity, NotFoundError>>;
    findAll(): Promise<RepositoryResult<DocumentEntity[]>>;
    findAllPaginated(
        params: PaginationOptions
    ): Promise<RepositoryResult<Paginated<DocumentEntity>>>;
    delete(entity: DocumentEntity): Promise<RepositoryResult<boolean>>;
    addTag(id: string, entity: TagEntity): Promise<RepositoryResult<boolean>>;
    updateTag(
        id: string,
        entity: TagEntity
    ): Promise<RepositoryResult<boolean>>;
    removeTag(
        id: string,
        entity: TagEntity
    ): Promise<RepositoryResult<boolean>>;
}
