import { EntityInvalidError } from "../../lib/exceptions/exceptions";

export class UserInvalidError extends EntityInvalidError {
    readonly message = "User entity is invalid";

    constructor(cause?: string, metadata?: unknown) {
        super(UserInvalidError.message, cause, metadata);
    }
}
