export interface ILogger {
    log(...args: [any]): void;

    warn(...args: [any]): void;

    logQuery(query: string, params: unknown[]): void;
}
