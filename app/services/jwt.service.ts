import { IUserRepository } from "../repositories/IUserRepository";
import jwt, { Secret } from "jsonwebtoken";
import { compare } from "bcrypt";
import { JwtRefreshResponse, JwtResponse } from "../lib/validators/JWTSchemas";
import { Result } from "../lib/util/result";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { Inject } from "../lib/di/Inject";
import { LOGGER, USER_REPOSITORY } from "../lib/di/di.tokens";
import { parseResponse } from "../lib/util/parseResponse";
import { ILogger } from "../lib/logging/ILogger";

const accessSecret: Secret | undefined = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret: Secret | undefined = process.env.REFRESH_TOKEN_SECRET;

@InjectionTarget()
export class JWTService {
    constructor(
        @Inject(USER_REPOSITORY) private repository: IUserRepository,
        @Inject(LOGGER)
        private logger: ILogger
    ) {}

    async generate(userName: string, password: string) {
        if (accessSecret === undefined) {
            return new Result<any, Error>(
                null,
                new Error("SECRET_KEY missing")
            );
        }

        let response = await this.repository.findByName(userName);

        if (response.isErr()) {
            return new Result<any, Error>(null, response.getErr());
        }

        const user = response.unwrap();

        if (!user) {
            return new Result<any, Error>(
                null,
                new Error("User not registered")
            );
        }

        const isMatch = await compare(password, user!.password);

        if (!isMatch) {
            return new Result<any, Error>(null, new Error("Password invalid"));
        }

        let accessToken = jwt.sign(
            {
                Id: user.Id,
                userName: userName,
                userRole: user.userRole,
            },
            accessSecret as string,
            { expiresIn: "1h" }
        );
        let refreshToken = jwt.sign(
            { Id: user.Id, userName: userName },
            refreshSecret as string,
            {
                expiresIn: "2h",
            }
        );

        let result = {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };

        return parseResponse(JwtResponse, result);
    }

    async refresh(refreshToken: string) {
        if (refreshSecret === undefined) {
            return new Result<any, Error>(
                null,
                new Error("SECRET_KEY missing")
            );
        }

        if (!refreshToken) {
            return new Result<any, Error>(
                null,
                new Error("Refresh token not provided")
            );
        }

        let decoded = jwt.verify(refreshToken, refreshSecret);
        console.log(decoded);

        let result;

        if (typeof decoded === "string" || typeof decoded === "undefined") {
        } else {
            let response = await this.repository.findById(decoded.Id);

            if (response.isErr()) {
                return new Result<any, Error>(null, response.getErr());
            }

            const user = response.unwrap();

            if (!user) {
                return new Result<any, Error>(
                    null,
                    new Error("User not registered")
                );
            }

            let accessToken = jwt.sign(
                {
                    userName: user!.userName,
                    password: user!.password,
                    userRole: user?.userRole,
                },
                accessSecret as string,
                { expiresIn: "1h" }
            );

            result = {
                accessToken: accessToken,
            };
        }

        return parseResponse(JwtRefreshResponse, result);
    }
}
