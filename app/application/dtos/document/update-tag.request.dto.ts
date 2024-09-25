import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { UpdateTagRequestSchema } from "./schemas/update-tag.request.schema";

export class UpdateTagRequestDto extends RequestBase {
    constructor(
        readonly id: string,
        readonly tag: {
            readonly key: string;
            readonly name: string;
        }
    ) {
        super();
    }

    static override fromBody(body: any, _query: any, params: any): RequestBase {
        return new UpdateTagRequestDto(params.id, {
            key: body.key,
            name: body.key,
        });
    }

    validate(): DtoValidationResult<any> {
        return UpdateTagRequestDto.validate(UpdateTagRequestSchema, {
            id: this.id,
            tag: this.tag,
        });
    }
}
