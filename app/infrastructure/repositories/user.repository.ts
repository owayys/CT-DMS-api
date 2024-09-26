import { eq } from "drizzle-orm";
import { DATABASE, USER_MAPPER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { IDrizzleConnection } from "../database/types";
import { UserTable } from "../database/schema";
import { UserEntity } from "../../domain/entities/user/user.entity";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { UserModel } from "../mappers/user.mapper";
import { UserResponseDto } from "../../application/dtos/user/user.response.dto";
import {
    AlreadyExistsError,
    NotFoundError,
    RepositoryResult,
    Paginated,
    PaginationOptions,
    AppError,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";
import { IUserRepository } from "../../domain/repositories/user.repository.port";
import { paginate } from "../../lib/util/paginate.util";

@InjectionTarget()
export class UserRepository implements IUserRepository {
    constructor(
        @Inject(DATABASE) private _db: IDrizzleConnection,
        @Inject(USER_MAPPER)
        private mapper: Mapper<UserEntity, UserModel, UserResponseDto>
    ) {}

    async insert(
        entity: UserEntity
    ): Promise<RepositoryResult<UserEntity, AlreadyExistsError>> {
        try {
            const [user] = await this._db
                .insert(UserTable)
                .values({
                    userName: entity.userName,
                    password: entity.password.toString(),
                })
                .onConflictDoNothing()
                .returning();
            if (user === undefined) {
                return Result.Err(
                    AppError.AlreadyExists("Username already exists")
                );
            } else {
                return Result.Ok(this.mapper.toDomain(user));
            }
        } catch (err) {
            return Result.Err(err);
        }
    }

    async findOneById(id: string): Promise<RepositoryResult<UserEntity>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.Id, id));
            if (user === undefined) {
                return Result.Err(AppError.NotFound("User not found"));
            }
            return Result.Ok(this.mapper.toDomain(user));
        } catch (err) {
            return Result.Err(err);
        }
    }

    async findOneByName(name: string): Promise<RepositoryResult<UserEntity>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.userName, name));

            if (user === undefined) {
                return Result.Err(AppError.NotFound("User not found"));
            }
            return Result.Ok(this.mapper.toDomain(user));
        } catch (err) {
            return Result.Err(err);
        }
    }

    async findAll(): Promise<RepositoryResult<UserEntity[]>> {
        try {
            const users = await this._db.query.UserTable.findMany();

            return Result.Ok(users.map(this.mapper.toDomain));
        } catch (err) {
            return Result.Err(err);
        }
    }

    async findAllPaginated(
        params: PaginationOptions
    ): Promise<RepositoryResult<Paginated<UserEntity>>> {
        try {
            let users = await this._db.query.UserTable.findMany();

            let usersMapped = users.map(this.mapper.toDomain);

            const response: Paginated<UserEntity> = paginate(
                usersMapped,
                params
            );

            return Result.Ok(response);
        } catch (err) {
            return Result.Err(err);
        }
    }

    async update(
        entity: UserEntity
    ): Promise<RepositoryResult<UserEntity, NotFoundError>> {
        try {
            const [user] = await this._db
                .update(UserTable)
                .set({
                    password: entity.password.toString(),
                })
                .where(eq(UserTable.Id, entity.id!.toString()))
                .returning();
            if (!user) {
                return Result.Err(AppError.NotFound("User not found"));
            }
            return Result.Ok(this.mapper.toDomain(user));
        } catch (err) {
            return Result.Err(err);
        }
    }

    async delete(entity: UserEntity): Promise<RepositoryResult<boolean>> {
        try {
            this._db
                .delete(UserTable)
                .where(eq(UserTable.Id, entity.id!.toString()));

            return Result.Ok(true);
        } catch (err) {
            return Result.Err(err);
        }
    }
}
