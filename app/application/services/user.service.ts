// import { IUserRepository } from "../repositories/IUserRepository";
import { IUserRepository } from "../../domain/repositories/user.repository.port";

import { LOGGER, USER_MAPPER, USER_REPOSITORY } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";

import { z } from "zod";
import { parseResponse } from "../../lib/util/parse-response.util";
import {
    AllUsersResponse,
    UserResponse,
} from "../../lib/validators/user.validators";
import { UpdateResponse } from "../../lib/validators/common";
import { ILogger } from "../../lib/logging/ILogger";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserModel } from "../../infrastructure/mappers/user.mapper";
import { UserResponseDto } from "../dtos/user.response.dto";
import { PaginatedQueryParams } from "../../lib/ddd/repository.port";
import { AppResult } from "@carbonteq/hexapp";

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

    async register(
        userName: string,
        password: string
    ): Promise<AppResult<UserResponseDto>> {
        const user = UserEntity.create({ userName, password });
        const result = await this.repository.insert(user);

        if (result.isOk()) {
            return parseResponse(
                UserResponse,
                this.mapper.toResponse(result.unwrap())
            );
        } else {
            return result;
        }
    }

    async get(userId: string): Promise<AppResult<UserResponseDto>> {
        const result = await this.repository.findOneById(userId);

        if (result.isOk()) {
            return parseResponse(
                UserResponse,
                this.mapper.toResponse(result.unwrap())
            );
        } else {
            return result;
        }
    }

    async getAll(
        pageNumber: number,
        pageSize: number
    ): Promise<AppResult<any>> {
        const params: PaginatedQueryParams = {
            pageSize,
            pageNumber,
            orderBy: {
                field: "id",
                param: "asc",
            },
        };

        const result = await this.repository.findAllPaginated(params);

        if (result.isOk()) {
            const response = result.unwrap();
            const mappedResponse = {
                ...response,
                items: response.items.map(this.mapper.toResponse),
            };
            return parseResponse(AllUsersResponse, mappedResponse);
        } else {
            return result;
        }
    }

    async update(userId: string, password: string): Promise<any> {
        const result = await this.repository.findOneById(userId);

        if (result.isOk()) {
            const user = result.unwrap();
            user.changePassword(password);
            const updateResult = await this.repository.update(user);

            if (updateResult.isOk()) {
                return parseResponse(UpdateResponse, {
                    success: updateResult.unwrap(),
                });
            } else {
                return updateResult;
            }
        } else {
            return result;
        }
    }
}
