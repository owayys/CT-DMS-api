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

    validate(): DtoValidationResult<any> {
        return DeleteTagRequestDto.validate(DeleteTagRequestSchema, {
            id: this.id,
            tag: this.tag,
        });
    }
}
