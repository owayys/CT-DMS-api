import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { UpdateMetaRequestSchema } from "./schemas/update-meta.request.schema";
import { UserDefinedMetadata } from "../../../domain/types/document.types";

export class UpdateMetaRequestDto extends RequestBase {
    protected constructor(
        readonly id: string,
        readonly meta: UserDefinedMetadata
    ) {
        super();
    }

    static override fromBody(body: any, _query: any, params: any): RequestBase {
        return new UpdateMetaRequestDto(params.id, body.meta);
    }

    validate(): DtoValidationResult<any> {
        return UpdateMetaRequestDto.validate(UpdateMetaRequestSchema, {
            id: this.id,
            meta: this.meta,
        });
    }
}
