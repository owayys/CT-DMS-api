import { AppResult } from "@carbonteq/hexapp";
import { RepositoryPort } from "../../lib/ddd/repository.port";
import { UserEntity } from "../entities/user.entity";

export interface IUserRepository extends RepositoryPort<UserEntity> {
    findOneByName(id: string): Promise<AppResult<UserEntity>>;
}
