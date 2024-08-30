import { eq } from "drizzle-orm";
import { IDrizzleConnection } from "../types";
import { IUserRepository } from "./IUserRepository";
import { UserTable } from "../database/schema";
import { Result } from "../lib/util/result";
import { z } from "zod";
import { User } from "../lib/validators/userSchemas";

type User = z.infer<typeof User>;

export class DrizzleUserRepository implements IUserRepository {
    constructor(private _db: IDrizzleConnection) {}

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

    async all(pageNumber: number, pageSize: number): Promise<any> {
        return await this._db.query.UserTable.findMany({
            columns: {
                userRole: false,
                password: false,
            },
            limit: pageSize,
            offset: pageNumber * pageSize,
        });
    }

    async save(userName: string, passwordHash: string): Promise<any> {
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

        return user;
    }

    async update(userId: string, password: string): Promise<any> {
        await this._db
            .update(UserTable)
            .set({
                password: password,
            })
            .where(eq(UserTable.Id, userId));

        return {
            success: true,
        };
    }
}
