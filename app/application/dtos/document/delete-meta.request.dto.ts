import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { DeleteMetaRequestSchema } from "./schemas/delete-meta.request.schema";

export class DeleteMetaRequestDto extends RequestBase {
    protected constructor(readonly id: string) {
        super();
    }

    static override fromBody(
        _body: any,
        _query: any,
        params: any
    ): RequestBase {
        return new DeleteMetaRequestDto(params.id);
    }

    validate(): DtoValidationResult<any> {
        return DeleteMetaRequestDto.validate(DeleteMetaRequestSchema, {
            id: this.id,
        });
    }
}
