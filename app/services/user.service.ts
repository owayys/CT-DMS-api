// import { IUserRepository } from "../repositories/IUserRepository";
import { IUserRepository } from "../domain/repositories/user.repository.port";

import { Result } from "../lib/util/result";
import { LOGGER, USER_MAPPER, USER_REPOSITORY } from "../lib/di/di.tokens";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { Inject } from "../lib/di/Inject";

import { z } from "zod";
import { parseResponse } from "../lib/util/parseResponse";
import { AllUsersResponse, UserResponse } from "../lib/validators/userSchemas";
import { UpdateResponse } from "../lib/validators/common";
import { ILogger } from "../lib/logging/ILogger";
import { Mapper } from "../lib/ddd/mapper.interface";
import { UserEntity } from "../domain/entities/user.entity";
import { UserModel } from "../mappers/user.mapper";
import { UserResponseDto } from "../dtos/user.response.dto";
import { PaginatedQueryParams } from "../lib/ddd/repository.port";

type UserResponse = z.infer<typeof UserResponse>;

@InjectionTarget()
export class UserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private repository: IUserRepository,
        @Inject(LOGGER)
        private logger: ILogger,
        @Inject(USER_MAPPER)
        private mapper: Mapper<UserEntity, UserModel, UserResponseDto>
    ) {}

    async save(
        userName: string,
        password: string
    ): Promise<Result<UserResponse, Error>> {
        const user = UserEntity.create({
            userName: userName,
            password: password,
        });
        return (await this.repository.insert(user)).bind((response) =>
            parseResponse(UserResponse, this.mapper.toResponse(response))
        );
    }

    async get(userId: string): Promise<Result<UserResponse, Error>> {
        return (await this.repository.findOneById(userId)).bind((response) =>
            parseResponse(UserResponse, this.mapper.toResponse(response))
        );
    }

    async getAll(pageNumber: number, pageSize: number): Promise<any> {
        const params: PaginatedQueryParams = {
            pageSize,
            pageNumber,
            orderBy: {
                field: "id",
                param: "asc",
            },
        };
        return (await this.repository.findAllPaginated(params)).bind(
            (response) => {
                const mappedResponse = {
                    ...response,
                    items: response.items.map(this.mapper.toResponse),
                };
                console.log(mappedResponse);
                return parseResponse(AllUsersResponse, mappedResponse);
            }
        );
    }

    async update(userId: string, password: string): Promise<any> {
        const response = await this.repository.findOneById(userId);

        if (response.isOk()) {
            const user = response.unwrap();
            user.changePassword(password);
            return (await this.repository.update(user)).bind((response) =>
                parseResponse(UpdateResponse, { success: response })
            );
        } else {
            return response;
        }
    }
}
