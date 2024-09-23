import { eq } from "drizzle-orm";
import { IUserRepository } from "../../domain/repositories/user.repository.port";
import { DATABASE, USER_MAPPER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
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
import { AppResult } from "@carbonteq/hexapp";

@InjectionTarget()
export class UserRepository implements IUserRepository {
    constructor(
        @Inject(DATABASE) private _db: IDrizzleConnection,
        @Inject(USER_MAPPER)
        private mapper: Mapper<UserEntity, UserModel, UserResponseDto>
    ) {}

    async insert(entity: UserEntity): Promise<AppResult<UserEntity>> {
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
                return AppResult.Err(
                    new ConflictException("Username already exists")
                );
            }
            return AppResult.Ok(this.mapper.toDomain(user));
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async findOneById(id: string): Promise<AppResult<UserEntity>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.Id, id));
            if (user === undefined) {
                return AppResult.Err(new NotFoundException("User not found"));
            }
            return AppResult.Ok(this.mapper.toDomain(user));
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async findOneByName(name: string): Promise<AppResult<UserEntity>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.userName, name));

            if (user === undefined) {
                return AppResult.Err(new NotFoundException("User not found"));
            }
            return AppResult.Ok(this.mapper.toDomain(user));
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async findAll(): Promise<AppResult<UserEntity[]>> {
        try {
            const users = await this._db.query.UserTable.findMany();

            return AppResult.Ok(users.map(this.mapper.toDomain));
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async findAllPaginated(
        params: PaginatedQueryParams
    ): Promise<AppResult<Paginated<UserEntity>>> {
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

            return AppResult.Ok(response);
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async update(entity: UserEntity): Promise<AppResult<boolean>> {
        try {
            const [Id] = await this._db
                .update(UserTable)
                .set({
                    password: entity.password.toString(),
                })
                .where(eq(UserTable.Id, entity.id!.toString()))
                .returning({
                    Id: UserTable.Id,
                });
            if (!Id) {
                return AppResult.Ok(false);
            }
            return AppResult.Ok(true);
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async delete(entity: UserEntity): Promise<AppResult<boolean>> {
        try {
            this._db
                .delete(UserTable)
                .where(eq(UserTable.Id, entity.id!.toString()));

            return AppResult.Ok(true);
        } catch (err) {
            return AppResult.Err(err);
        }
    }
}
