import { IUserRepository } from "../repositories/IUserRepository";
import jwt, { Secret } from "jsonwebtoken";
import { compare } from "bcrypt";
import { JwtRefreshResponse, JwtResponse } from "../lib/validators/JWTSchemas";
import { Result } from "../lib/util/result";

const accessSecret: Secret = process.env.ACCESS_TOKEN_SECRET || "ACCESS";
const refreshSecret: Secret = process.env.REFRESH_TOKEN_SECRET || "REFRESH";

export class JWTService {
    constructor(private repository: IUserRepository) {}

    async generate(userName: string, password: string) {
        try {
            let response = await this.repository.findByName(userName);

            if (response.isErr()) {
                return new Result<any, Error>(null, response.getErr());
            }

            const user = response.unwrap();

            if (!user) {
                return {
                    error: {
                        message: "User not registered",
                    },
                };
            }

            const isMatch = await compare(password, user!.password);

            if (!isMatch) {
                return {
                    error: {
                        message: "Invalid password",
                    },
                };
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

            const { data, success, error } = JwtResponse.safeParse(result);

            return success ? data : error;
        } catch (err) {
            return {
                error: {
                    message: err.message,
                },
            };
        }
    }

    async refresh(refreshToken: string) {
        try {
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
                    return {
                        error: {
                            message: "User not registered",
                        },
                    };
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

            const { data, success, error } =
                JwtRefreshResponse.safeParse(result);

            return success ? data : error;
        } catch (err) {
            return {
                error: {
                    message: "Refresh token expired or invalid",
                },
            };
        }
    }
}
