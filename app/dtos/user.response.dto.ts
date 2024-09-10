import { ResponseBase } from "../lib/api/response.base";

export class UserResponseDto extends ResponseBase {
    userName: string;
    // content: string;
    // contentType: string;
    // tags: { key: string; name: string }[];
    // role: string;
    // password: string;
}
