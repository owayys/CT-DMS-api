import { GetUserRequestSchema } from "./schemas/get-user.request.schema";
import { RequestBase } from "../../../lib/api/request.base";

export class GetUserRequestDto extends RequestBase {
    protected constructor(readonly id: string) {
        super();
    }

    static override fromBody(
        _body: any,
        _query: any,
        params: any
    ): RequestBase {
        return new GetUserRequestDto(params.id);
    }

    validate() {
        return GetUserRequestDto.validate(GetUserRequestSchema, {
            id: this.id,
        });
    }
}
