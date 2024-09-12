import { USER_REPOSITORY } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Result } from "../../lib/util/result";
import { UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.port";
import { RegisterUserCommand } from "../types/user.types";

@InjectionTarget()
export class RegisterUserService {
    constructor(@Inject(USER_REPOSITORY) private repository: IUserRepository) {}

    async execute(
        command: RegisterUserCommand
    ): Promise<Result<UserEntity, Error>> {
        const existing = await this.repository.findOneByName(command.userName);

        if (!existing.isErr()) {
            if (existing.unwrap()) {
                return new Result<UserEntity, Error>(
                    null,
                    new Error("Username already exists")
                );
            }
        }

        const user = UserEntity.create({
            userName: command.userName,
            password: command.password,
        });

        return await this.repository.insert(user);
    }
}
