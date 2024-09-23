import { eq } from "drizzle-orm";
import { DATABASE, USER_MAPPER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { IDrizzleConnection } from "../database/types";
import { UserTable } from "../database/schema";
import { UserEntity } from "../../domain/entities/user.entity";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { UserModel } from "../mappers/user.mapper";
import { UserResponseDto } from "../../application/dtos/user.response.dto";
import { PaginatedQueryParams } from "../../lib/ddd/repository.port";
import {
    ConflictException,
    NotFoundException,
} from "../../lib/exceptions/exceptions";
import {
    AlreadyExistsError,
    BaseRepository,
    NotFoundError,
    RepositoryResult,
    Paginated,
    PaginationOptions,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";

@InjectionTarget()
export class UserRepository implements BaseRepository<UserEntity> {
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
            if (!user) {
                return Result.Err(
                    new ConflictException("Username already exists")
                );
            }
            return Result.Ok(this.mapper.toDomain(user));
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
                return Result.Err(new NotFoundException("User not found"));
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
                return Result.Err(new NotFoundException("User not found"));
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
        params: PaginatedQueryParams
    ): Promise<RepositoryResult<Paginated<UserEntity>>> {
        try {
            let users = await this._db.query.UserTable.findMany();

            let totalPages = Math.ceil(users.length / params.pageSize);
            let page = Math.min(totalPages - 1, params.pageNumber);
            let items = users.slice(
                page * params.pageSize,
                page * params.pageSize + params.pageSize
            );
            let size = Math.min(items.length, params.pageSize);

            const response: Paginated<UserEntity> = {
                pageNum: page + 1,
                pageSize: size,
                totalPages: totalPages,
                data: items.map(this.mapper.toDomain),
            };

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
                return Result.Err(new NotFoundException("User not found"));
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
