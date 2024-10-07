import { IUserRepository } from "../../domain/repositories/user.repository.port";

import {
    LOGGER,
    SLACK_NOTIFICATION_SERVICE,
    USER_MAPPER,
    USER_REPOSITORY,
} from "../../lib/di/di.tokens";
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
import { UserEntity } from "../../domain/entities/user/user.entity";
import { UserModel } from "../../infrastructure/mappers/user.mapper";
import { UserResponseDto } from "../dtos/user/user.response.dto";
import { AppResult, PaginationOptions } from "@carbonteq/hexapp";
import { Services } from "./types";

type UserResponse = z.infer<typeof UserResponse>;

@InjectionTarget()
export class UserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private repository: IUserRepository,
        @Inject(LOGGER)
        private logger: ILogger,
        @Inject(USER_MAPPER)
        private mapper: Mapper<UserEntity, UserModel, UserResponseDto>,
        @Inject(SLACK_NOTIFICATION_SERVICE)
        private notifications: Services[typeof SLACK_NOTIFICATION_SERVICE]
    ) {}

    async register(
        userName: string,
        password: string
    ): Promise<AppResult<UserResponseDto>> {
        const user = UserEntity.create({ userName, password });
        const result = await this.repository.insert(user);

        if (result.isOk()) {
            const notificationResponse = await this.notifications.sendMessage(
                `[!] REGISTERED USER: ${user.id}`
            );

            if (notificationResponse.isErr()) {
                this.logger.error(notificationResponse);
            }

            return parseResponse(
                UserResponse,
                this.mapper.toResponse(result.unwrap())
            );
        } else {
            return AppResult.Err(result.unwrapErr());
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
            return AppResult.Err(result.unwrapErr());
        }
    }

    async getAll(
        pageNumber: number,
        pageSize: number
    ): Promise<AppResult<any>> {
        const params = PaginationOptions.create({
            pageNum: pageNumber,
            pageSize,
        });

        if (params.isErr()) {
            return AppResult.Err(params.unwrapErr());
        }

        const result = await this.repository.findAllPaginated(params.unwrap());

        if (result.isOk()) {
            const response = result.unwrap();
            const mappedResponse = {
                ...response,
                data: response.data.map(this.mapper.toResponse),
            };
            return parseResponse(AllUsersResponse, mappedResponse);
        } else {
            return AppResult.Err(result.unwrapErr());
        }
    }

    async update(userId: string, password: string): Promise<any> {
        const result = await this.repository.findOneById(userId);

        if (result.isOk()) {
            const user = result.unwrap();
            user.changePassword(password);
            const updateResult = await this.repository.update(user);

            if (updateResult.isOk()) {
                const notificationResponse =
                    await this.notifications.sendMessage(
                        `[!] UPDATE PASSWORD FOR USER: ${user.id}`
                    );

                if (notificationResponse.isErr()) {
                    this.logger.error(notificationResponse);
                }

                return parseResponse(UpdateResponse, {
                    success: true,
                });
            } else {
                return parseResponse(UpdateResponse, {
                    success: false,
                });
            }
        } else {
            return result;
        }
    }
}
