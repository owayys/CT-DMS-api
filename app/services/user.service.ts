import bcrypt from "bcrypt";
import { IUserRepository } from "../repositories/IUserRepository";
import { AllUsersResponse, UserResponse } from "../lib/validators/userSchemas";
import { UpdateResponse } from "../lib/validators/common";
import { Result } from "../lib/util/result";
import { z } from "zod";

type UserResponse = z.infer<typeof UserResponse>;

export class UserService {
    constructor(private repository: IUserRepository) {}

    async save(userName: string, password: string): Promise<any> {
        const salt = await bcrypt.genSalt(10);
        let passwordHash = await bcrypt.hash(password, salt);
        const response = await this.repository.save(userName, passwordHash);
        const { data, success, error } = UserResponse.safeParse(response);

        return success ? data : error;
    }

    async get(userId: string): Promise<any> {
        const response = await this.repository.findById(userId);
        const { data, success, error } = UserResponse.safeParse(response);

        return success ? data : error;
    }

    async getAlt(userId: string): Promise<Result<UserResponse, Error>> {
        const response = await this.repository.findById(userId);

        if (response.isErr()) {
            console.error(response.getErr());
            return new Result<UserResponse, Error>(null, response.getErr());
        } else {
            const { data, success, error } = UserResponse.safeParse(
                response.unwrap()
            );
            return success
                ? new Result<UserResponse, Error>(data, null)
                : new Result<UserResponse, Error>(null, error);
        }
    }

    async getAll(pageNumber: number, pageSize: number): Promise<any> {
        const response = await this.repository.all(pageNumber, pageSize);
        console.log(response);

        const { data, success, error } = AllUsersResponse.safeParse(response);

        return success ? data : error;
    }

    async update(userId: string, password: string): Promise<any> {
        const salt = await bcrypt.genSalt(10);
        let passwordHash = await bcrypt.hash(password, salt);
        const response = await this.repository.update(userId, passwordHash);

        const { data, success, error } = UpdateResponse.safeParse(response);

        return success ? data : error;
    }
}
