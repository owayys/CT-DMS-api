import { GetDocumentContentRequestSchema } from "./schemas/get-document-content.request.schema";
import { RequestBase } from "../../../lib/api/request.base";

export class GetDocumentContentRequestDto extends RequestBase {
    protected constructor(readonly id: string) {
        super();
    }

    static override fromBody(
        _body: any,
        _query: any,
        params: any
    ): RequestBase {
        return new GetDocumentContentRequestDto(params.id);
    }

    validate() {
        return GetDocumentContentRequestDto.validate(
            GetDocumentContentRequestSchema,
            {
                id: this.id,
            }
        );
    }
}
