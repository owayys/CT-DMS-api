export interface ILogger {
    log(...args: [any]): void;

    warn(...args: [any]): void;
}
