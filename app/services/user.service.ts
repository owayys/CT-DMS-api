import { IUserRepository } from "../repositories/IUserRepository";

import { Result } from "../lib/util/result";
import { USER_REPOSITORY } from "../lib/di/di.tokens";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { Inject } from "../lib/di/Inject";

import { z } from "zod";
import { parseResponse } from "../lib/util/parseResponse";
import { AllUsersResponse, UserResponse } from "../lib/validators/userSchemas";
import { UpdateResponse } from "../lib/validators/common";
import { generateHash } from "../lib/util/generateHash";

type UserResponse = z.infer<typeof UserResponse>;

// interface IUserRepository {
//     findById(userId: string): Promise<Result<any, Error>>;

//     findByName(userName: string): Promise<any>;

//     all(pageNumber: number, pageSize: number): Promise<any>;

//     save(userName: string, passwordHash: string): Promise<any>;

//     update(userId: string, password: string): Promise<any>;
// }

@InjectionTarget()
export class UserService {
    private repository: IUserRepository;
    constructor(
        @Inject(USER_REPOSITORY)
        repo?: IUserRepository | any
    ) {
        if (!repo) {
            throw Error("No User Repository provided");
        }
        this.repository = repo;
    }

    async save(
        userName: string,
        password: string
    ): Promise<Result<UserResponse, Error>> {
        const passwordHash = await generateHash(password);
        return passwordHash.isErr()
            ? passwordHash
            : (
                  await this.repository.save(userName, passwordHash.unwrap())
              ).bind((response) => parseResponse(UserResponse, response));
    }

    async get(userId: string): Promise<Result<UserResponse, Error>> {
        return (await this.repository.findById(userId)).bind((response) =>
            parseResponse(UserResponse, response)
        );
    }

    async getAll(pageNumber: number, pageSize: number): Promise<any> {
        return (await this.repository.all(pageNumber, pageSize)).bind(
            (response) => parseResponse(AllUsersResponse, response)
        );
    }

    async update(userId: string, password: string): Promise<any> {
        const passwordHash = await generateHash(password);
        return passwordHash.isErr()
            ? passwordHash
            : (
                  await this.repository.update(userId, passwordHash.unwrap())
              ).bind((response) => parseResponse(UpdateResponse, response));
    }
}
