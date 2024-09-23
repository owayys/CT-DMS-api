import { IUserRepository } from "../../domain/repositories/user.repository.port";
import jwt, { Secret } from "jsonwebtoken";
import {
    JwtRefreshResponse,
    JwtResponse,
} from "../../lib/validators/jwt.validators";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { LOGGER, USER_REPOSITORY } from "../../lib/di/di.tokens";
import { parseResponse } from "../../lib/util/parse-response.util";
import { ILogger } from "../../lib/logging/ILogger";
import {
    ArgumentInvalidException,
    ArgumentNotProvidedException,
    InternalServerError,
} from "../../lib/exceptions/exceptions";
import { AppResult } from "@carbonteq/hexapp";

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
            return AppResult.Err(new InternalServerError("SECRET_KEY missing"));
        }

        let response = await this.repository.findOneByName(userName);

        if (response.isErr()) {
            return response;
        }

        const user = response.unwrap();

        if (!user) {
            return AppResult.Err(
                new ArgumentInvalidException("User not registered")
            );
        }

        const isMatch = await user.validatePassword(password);

        if (!isMatch) {
            return AppResult.Err(
                new ArgumentInvalidException("Password invalid")
            );
        }

        let accessToken = jwt.sign(
            {
                Id: user.userId,
                userName: user.userName,
                userRole: user.role.toString(),
            },
            accessSecret as string,
            { expiresIn: "1h" }
        );
        let refreshToken = jwt.sign(
            { Id: user.userId, userName: user.userName },
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

    async refresh(refreshToken: string | undefined) {
        if (refreshSecret === undefined) {
            return AppResult.Err(new InternalServerError("SECRET_KEY missing"));
        }

        if (!refreshToken) {
            return AppResult.Err(
                new ArgumentNotProvidedException("Refresh token not provided")
            );
        }

        let decoded = jwt.verify(refreshToken, refreshSecret);

        let result;

        if (typeof decoded === "string" || typeof decoded === "undefined") {
        } else {
            let response = await this.repository.findOneById(decoded.Id);

            if (response.isErr()) {
                return response;
            }

            const user = response.unwrap();

            if (!user) {
                return AppResult.Err(
                    new ArgumentInvalidException("User not registered")
                );
            }

            let accessToken = jwt.sign(
                {
                    userName: user!.userName,
                    password: user!.password,
                    userRole: user?.role.toString(),
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
