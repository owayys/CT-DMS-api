// import { Result } from "../util/result";

import { AppResult } from "@carbonteq/hexapp";

export interface IDomainService<T, U> {
    execute(command: T): Promise<AppResult<U>>;
}
