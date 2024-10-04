import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { DeleteTagRequestSchema } from "./schemas/delete-tag.request.schema";

export class DeleteTagRequestDto extends RequestBase {
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
        return new DeleteTagRequestDto(params.id, {
            key: body.key,
            name: body.key,
        });
    }

    validate(): DtoValidationResult<any> {
        return DeleteTagRequestDto.validate(DeleteTagRequestSchema, {
            id: this.id,
            tag: this.tag,
        });
    }
}
