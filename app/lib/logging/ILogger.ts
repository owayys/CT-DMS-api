import { Logger } from "@carbonteq/hexapp";

export interface ILogger extends Logger {
    log(...args: [any]): void;

    warn(...args: [any]): void;

    logQuery(query: string, params: unknown[]): void;
}
