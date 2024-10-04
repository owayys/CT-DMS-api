import {
    AppResult,
    BaseRepository,
    NotFoundError,
    Paginated,
    PaginationOptions,
    RepositoryResult,
} from "@carbonteq/hexapp";
import { DocumentEntity } from "../entities/document/document.entity";

export interface IDocumentRepository extends BaseRepository<DocumentEntity> {
    findByOwner(owner: string): Promise<RepositoryResult<DocumentEntity[]>>;
    findOneById(
        id: string
    ): Promise<RepositoryResult<DocumentEntity, NotFoundError>>;
    findAll(): Promise<RepositoryResult<DocumentEntity[]>>;
    findAllPaginated(
        params: PaginationOptions,
        filterBy?: any
    ): Promise<RepositoryResult<Paginated<DocumentEntity>>>;
    delete(entity: DocumentEntity): Promise<RepositoryResult<boolean>>;
}
