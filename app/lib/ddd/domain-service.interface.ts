import { Result } from "../util/result";

export interface IDomainService<T, U> {
    execute(command: T): Promise<Result<U, Error>>;
}
