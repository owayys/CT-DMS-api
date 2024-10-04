import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { LoginRequestSchema } from "./schemas/login.request.schema";

export class LoginRequestDto extends RequestBase {
    constructor(readonly userName: string, readonly password: string) {
        super();
    }

    static override fromBody(
        body: any,
        _query: any,
        _params: any
    ): RequestBase {
        return new LoginRequestDto(body.userName, body.password);
    }

    validate(): DtoValidationResult<any> {
        return LoginRequestDto.validate(LoginRequestSchema, {
            userName: this.userName,
            password: this.password,
        });
    }
}
