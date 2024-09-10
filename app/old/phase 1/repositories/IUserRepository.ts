import { Result } from "../lib/util/result";

export interface IUserRepository {
    findById(userId: string): Promise<Result<any, Error>>;

    findByName(userName: string): Promise<Result<any, Error>>;

    all(pageNumber: number, pageSize: number): Promise<Result<any, Error>>;

    save(userName: string, passwordHash: string): Promise<Result<any, Error>>;

    update(userId: string, password: string): Promise<Result<any, Error>>;
}
