import { CreateUserRequestSchema } from "./schemas/create-user.request.schema";
import { RequestBase } from "../../../lib/api/request.base";

export class CreateUserRequestDto extends RequestBase {
    protected constructor(
        readonly userName: string,
        readonly password: string
    ) {
        super();
    }

    static override fromBody(
        body: any,
        _query: any,
        _params: any
    ): RequestBase {
        return new CreateUserRequestDto(body.userName, body.password);
    }

    validate() {
        return CreateUserRequestDto.validate(CreateUserRequestSchema, {
            userName: this.userName,
            password: this.password,
        });
    }
}
