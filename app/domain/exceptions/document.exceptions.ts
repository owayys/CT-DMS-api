import { EntityInvalidError } from "../../lib/exceptions/exceptions";

export class DocumentInvalidError extends EntityInvalidError {
    readonly message = "Document entity is invalid";

    constructor(cause?: string, metadata?: unknown) {
        super(DocumentInvalidError.message, cause, metadata);
    }
}
