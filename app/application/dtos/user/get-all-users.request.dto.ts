import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { GetAllUsersRequestSchema } from "./schemas/get-all-users.request.schema";

export class GetAllUsersRequestDto extends RequestBase {
    protected constructor(
        readonly pageNumber: number,
        readonly pageSize: number
    ) {
        super();
    }

    static override fromBody(
        _body: any,
        query: any,
        _params: any
    ): RequestBase {
        return new GetAllUsersRequestDto(
            parseInt(query.pageNumber),
            parseInt(query.pageSize)
        );
    }

    validate(): DtoValidationResult<any> {
        return GetAllUsersRequestDto.validate(GetAllUsersRequestSchema, {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
        });
    }
}
