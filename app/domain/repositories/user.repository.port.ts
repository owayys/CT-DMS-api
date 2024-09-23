import {
    BaseRepository,
    NotFoundError,
    Paginated,
    PaginationOptions,
    RepositoryResult,
} from "@carbonteq/hexapp";
import { UserEntity } from "../entities/user.entity";

export interface IUserRepository extends BaseRepository<UserEntity> {
    findOneByName(
        id: string
    ): Promise<RepositoryResult<UserEntity, NotFoundError>>;
    findOneById(
        id: string
    ): Promise<RepositoryResult<UserEntity, NotFoundError>>;
    findAll(): Promise<RepositoryResult<UserEntity[]>>;
    findAllPaginated(
        params: PaginationOptions
    ): Promise<RepositoryResult<Paginated<UserEntity>>>;
    delete(entity: UserEntity): Promise<RepositoryResult<boolean>>;
}
