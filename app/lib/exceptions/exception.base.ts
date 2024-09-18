export interface SerializedException {
    message: string;
    code: string;
    stack?: string;
    cause?: string;
    metadata?: unknown;
}

export abstract class ExceptionBase extends Error {
    abstract code: string;

    constructor(
        readonly message: string,
        readonly cause?: string,
        readonly metadata?: unknown
    ) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): SerializedException {
        return {
            message: this.message,
            code: this.code,
            stack: this.stack,
            cause: this.cause,
            metadata: this.metadata,
        };
    }
}

// ref https://github.com/Sairyss/domain-driven-hexagon/blob/master/src/libs/exceptions/exception.base.ts
