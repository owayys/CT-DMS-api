import { AppResult } from "@carbonteq/hexapp";

export interface AppContext<R extends any = any> {
    headers?: Record<string, any>;
    query?: Record<string, any>;
    params?: Record<string, any>;
    body?: any;
    result?: AppResult<R>;
    status?: number;
    [x: string]: any;
}

export type MiddlewareFunc<T extends any = any> = (
    context: AppContext
) => Promise<AppContext<T>> | AppContext<T>;

export type InferResult<T> = T extends (context: AppContext) => infer U
    ? U
    : never;
