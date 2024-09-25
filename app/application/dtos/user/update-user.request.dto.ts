import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { UpdateUserRequestSchema } from "./schemas/update-user.request.schema";

export class UpdateUserRequestDto extends RequestBase {
    constructor(readonly id: string, readonly password: string) {
        super();
    }

    static override fromBody(body: any, _query: any, params: any): RequestBase {
        return new UpdateUserRequestDto(params.id, body.password);
    }

    validate(): DtoValidationResult<any> {
        return UpdateUserRequestDto.validate(UpdateUserRequestSchema, {
            id: this.id,
            password: this.password,
        });
    }
}
