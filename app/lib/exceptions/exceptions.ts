import { ExceptionBase } from "./exception.base";

export class EntityInvalidError extends ExceptionBase {
    static readonly message = "Entity invalid error";

    constructor(
        message = EntityInvalidError.message,
        cause?: string,
        metadata?: unknown
    ) {
        super(message, cause, metadata);
    }

    readonly code = "ENTITY_INVALID_ERROR";
}

export class ArgumentInvalidException extends ExceptionBase {
    readonly code = "ARGUMENT_INVALID";
}

export class ArgumentNotProvidedException extends ExceptionBase {
    readonly code = "ARGUMENT_NOT_PROVIDED";
}

export class ConflictException extends ExceptionBase {
    readonly code = "CONFLICT";
}

export class NotFoundException extends ExceptionBase {
    static readonly message = "Not found";

    constructor(message = NotFoundException.message) {
        super(message);
    }

    readonly code = "NOT_FOUND";
}

export class InternalServerError extends ExceptionBase {
    static readonly message = "Internal server error";

    constructor(message = NotFoundException.message) {
        super(message);
    }

    readonly code = "INTERNAL_SERVER_ERROR";
}
