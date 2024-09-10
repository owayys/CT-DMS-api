import { eq } from "drizzle-orm";
import { IDrizzleConnection } from "../../database/types";
import { IUserRepository } from "./IUserRepository";
import { UserTable } from "../database/schema";
import { Result } from "../lib/util/result";
import { z } from "zod";
import {
    User,
    AllUsersResponse,
    UserResponse,
} from "../lib/validators/userSchemas";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { Inject } from "../lib/di/Inject";
import { DATABASE } from "../lib/di/di.tokens";
import { UpdateResponse } from "../lib/validators/common";

type User = z.infer<typeof User>;
type AllUsers = z.infer<typeof AllUsersResponse>;
type UserResponse = z.infer<typeof UserResponse>;
type UpdateResponse = z.infer<typeof UpdateResponse>;

@InjectionTarget()
export class DrizzleUserRepository implements IUserRepository {
    constructor(@Inject(DATABASE) private _db: IDrizzleConnection) {}

    async findById(userId: string): Promise<Result<User, Error>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.Id, userId));

            if (user === undefined) {
                return new Result<User, Error>(
                    null,
                    new Error("User not found")
                );
            }

            return new Result<User, Error>(user, null);
        } catch (err) {
            return new Result<User, Error>(null, err);
        }
    }

    async findByName(userName: string): Promise<Result<User, Error>> {
        try {
            const [user] = await this._db
                .select()
                .from(UserTable)
                .where(eq(UserTable.userName, userName));

            if (user === undefined) {
                return new Result<User, Error>(
                    null,
                    new Error("User not found")
                );
            }

            return new Result<User, Error>(user, null);
        } catch (err) {
            return new Result<User, Error>(null, err);
        }
    }

    async all(
        pageNumber: number,
        pageSize: number
    ): Promise<Result<AllUsers, Error>> {
        try {
            const users = await this._db.query.UserTable.findMany({
                columns: {
                    userRole: false,
                    password: false,
                },
                limit: pageSize,
                offset: pageNumber * pageSize,
            });

            return new Result<AllUsers, Error>(users, null);
        } catch (err) {
            return new Result<AllUsers, Error>(null, err);
        }
    }

    async save(
        userName: string,
        passwordHash: string
    ): Promise<Result<UserResponse, Error>> {
        try {
            const [user] = await this._db
                .insert(UserTable)
                .values({
                    userName: userName,
                    password: passwordHash,
                })
                .returning({
                    Id: UserTable.Id,
                    userName: UserTable.userName,
                    createdAt: UserTable.createdAt,
                    updatedAt: UserTable.updatedAt,
                });
            return new Result<UserResponse, Error>(user, null);
        } catch (err) {
            return new Result<UserResponse, Error>(null, err);
        }
    }

    async update(
        userId: string,
        password: string
    ): Promise<Result<UpdateResponse, Error>> {
        try {
            const [Id] = await this._db
                .update(UserTable)
                .set({
                    password: password,
                })
                .where(eq(UserTable.Id, userId))
                .returning({
                    Id: UserTable.Id,
                });
            if (!Id) {
                return new Result<UpdateResponse, Error>(
                    null,
                    new Error("UserId invalid")
                );
            }
            return new Result<UpdateResponse, Error>({ success: true }, null);
        } catch (err) {
            return new Result<UpdateResponse, Error>(null, err);
        }
    }
}
