import { USER_REPOSITORY } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Result } from "../../lib/util/result";
import { IUserRepository } from "../repositories/user.repository.port";
import { LoginUserCommand } from "../types/user.types";

@InjectionTarget()
export class LoginUserService {
    constructor(@Inject(USER_REPOSITORY) private repository: IUserRepository) {}

    async execute(command: LoginUserCommand): Promise<Result<boolean, Error>> {
        const userResponse = await this.repository.findOneByName(
            command.userName
        );

        if (userResponse.isErr()) {
            return new Result<boolean, Error>(
                null,
                new Error(`Error finding user [${command.userName}]`)
            );
        }

        const user = userResponse.unwrap();

        const valid = await user.validatePassword(command.password);

        if (valid) {
            return new Result<boolean, Error>(true, null);
        } else {
            return new Result<boolean, Error>(false, null);
        }
    }
}
