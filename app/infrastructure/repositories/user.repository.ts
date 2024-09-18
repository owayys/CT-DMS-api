import { eq } from "drizzle-orm";
import { IUserRepository } from "../../domain/repositories/user.repository.port";
import { DATABASE, USER_MAPPER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Result } from "../../lib/util/result";
import { IDrizzleConnection } from "../database/types";
import { UserTable } from "../database/schema";
import { UserEntity } from "../../domain/entities/user.entity";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { UserModel } from "../mappers/user.mapper";
import { UserResponseDto } from "../../application/dtos/user.response.dto";
import { Paginated, PaginatedQueryParams } from "../../lib/ddd/repository.port";
import {
    ConflictException,
    NotFoundException,
} from "../../lib/exceptions/exceptions";

@InjectionTarget()
export class UserRepository implements IUserRepository {
    constructor(
        @Inject(DATABASE) private _db: IDrizzleConnection,
        @Inject(USER_MAPPER)
        private mapper: Mapper<UserEntity, UserModel, UserResponseDto>
    ) {}

    async insert(entity: UserEntity): Promise<Result<UserEntity, Error>> {
        try {
            const [user] = await this._db
                .insert(UserTable)
                .values({
                    userName: entity.userName,
                    password: entity.password,
                })
                .onConflictDoNothing()
                .returning();
            if (!user) {
                return new Result<UserEntity, Error>(
                    null,
                    new ConflictException("Username already exists")
                );
            }
            return new Result<UserEntity, Error>(
                this.mapper.toDomain(user),
                null
            );
        } catch (err) {
            return new Result<UserEntity, Error>(null, err);
        }
    }

    async findOneById(id: string): Promise<Result<UserEntity, Error>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.Id, id));

            if (user === undefined) {
                return new Result<UserEntity, Error>(
                    null,
                    new NotFoundException("User not found")
                );
            }

            return new Result<UserEntity, Error>(
                this.mapper.toDomain(user),
                null
            );
        } catch (err) {
            return new Result<UserEntity, Error>(null, err);
        }
    }

    async findOneByName(name: string): Promise<Result<UserEntity, Error>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.userName, name));

            if (user === undefined) {
                return new Result<UserEntity, Error>(
                    null,
                    new NotFoundException("User not found")
                );
            }

            return new Result<UserEntity, Error>(
                this.mapper.toDomain(user),
                null
            );
        } catch (err) {
            return new Result<UserEntity, Error>(null, err);
        }
    }

    async findAll(): Promise<Result<UserEntity[], Error>> {
        try {
            const users = await this._db.query.UserTable.findMany();

            return new Result<UserEntity[], Error>(
                users.map(this.mapper.toDomain),
                null
            );
        } catch (err) {
            return new Result<UserEntity[], Error>(null, err);
        }
    }

    async findAllPaginated(
        params: PaginatedQueryParams
    ): Promise<Result<Paginated<UserEntity>, Error>> {
        try {
            let users = await this._db.query.UserTable.findMany();

            let totalItems = users.length;
            let totalPages = Math.ceil(users.length / params.pageSize);
            let page = Math.min(totalPages, params.pageNumber);
            let items = users.slice(
                params.pageNumber * params.pageSize,
                params.pageNumber * params.pageSize + params.pageSize
            );
            let size = Math.min(items.length, params.pageSize);

            const response: Paginated<UserEntity> = {
                page: page + 1,
                size: size,
                totalPages: totalPages,
                totalItems: totalItems,
                items: items.map(this.mapper.toDomain),
            };

            return new Result<Paginated<UserEntity>, Error>(response, null);
        } catch (err) {
            return new Result<Paginated<UserEntity>, Error>(null, err);
        }
    }

    async update(entity: UserEntity): Promise<Result<boolean, Error>> {
        try {
            const [Id] = await this._db
                .update(UserTable)
                .set({
                    password: entity.password,
                })
                .where(eq(UserTable.Id, entity.id!.toString()))
                .returning({
                    Id: UserTable.Id,
                });
            if (!Id) {
                return new Result<boolean, Error>(false, null);
            }
            return new Result<boolean, Error>(true, null);
        } catch (err) {
            return new Result<boolean, Error>(null, err);
        }
    }

    async delete(entity: UserEntity): Promise<Result<boolean, Error>> {
        try {
            this._db
                .delete(UserTable)
                .where(eq(UserTable.Id, entity.id!.toString()));

            return new Result<boolean, Error>(true, null);
        } catch (err) {
            return new Result<boolean, Error>(null, err);
        }
    }
}
