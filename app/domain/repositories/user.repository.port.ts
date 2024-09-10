import { RepositoryPort } from "../../lib/ddd/repository.port";
import { Result } from "../../lib/util/result";
import { UserEntity } from "../entities/user.entity";

export interface IUserRepository extends RepositoryPort<UserEntity> {
    findOneByName(id: string): Promise<Result<UserEntity, Error>>;
}
