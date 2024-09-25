import { ResponseBase } from "../../../lib/api/response.base";
import { UserResponseSchema } from "./schemas/user.response.schema";

export class UserResponseDto extends ResponseBase {
    readonly userName: string;

    validate() {
        return UserResponseDto.validate(UserResponseSchema, {
            userName: this.userName,
        });
    }
}
