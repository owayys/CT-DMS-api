import { GetDocumentRequestSchema } from "./schemas/get-document.request.schema";
import { RequestBase } from "../../../lib/api/request.base";

export class GetDocumentRequestDto extends RequestBase {
    protected constructor(readonly id: string) {
        super();
    }

    static override fromBody(
        _body: any,
        _query: any,
        params: any
    ): RequestBase {
        return new GetDocumentRequestDto(params.id);
    }

    validate() {
        return GetDocumentRequestDto.validate(GetDocumentRequestSchema, {
            id: this.id,
        });
    }
}
