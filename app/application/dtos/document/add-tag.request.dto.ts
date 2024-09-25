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

    static override fromBody(body: any, _query: any, params: any): RequestBase {
        return new AddTagRequestDto(params.id, {
            key: body.key,
            name: body.key,
        });
    }

    validate(): DtoValidationResult<any> {
        return AddTagRequestDto.validate(AddTagRequestSchema, {
            id: this.id,
            tag: this.tag,
        });
    }
}
