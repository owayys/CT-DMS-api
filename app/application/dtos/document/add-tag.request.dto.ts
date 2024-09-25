import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { AddTagRequestSchema } from "./schemas/add-tag.request.schema";

export class AddTagRequestDto extends RequestBase {
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
        return AddTagRequestDto.validate(AddTagRequestSchema, {
            id: this.id,
            tag: this.tag,
        });
    }
}
