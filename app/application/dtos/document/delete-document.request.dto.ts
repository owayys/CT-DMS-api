import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { DeleteDocumentRequestSchema } from "./schemas/delete-document.request.schema";

export class DeleteDocumentRequestDto extends RequestBase {
    constructor(readonly id: string) {
        super();
    }

    static override fromBody(
        _body: any,
        _query: any,
        params: any
    ): RequestBase {
        return new DeleteDocumentRequestDto(params.id);
    }

    validate(): DtoValidationResult<any> {
        return DeleteDocumentRequestDto.validate(DeleteDocumentRequestSchema, {
            id: this.id,
        });
    }
}
