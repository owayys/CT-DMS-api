import { Result } from "../util/result";

export interface IDomainService<T> {
    execute(command: any): Promise<Result<T, Error>>;
}
