import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { GetAllRequestSchema } from "./schemas/get-all.request.schema";

export class GetAllRequestDto extends RequestBase {
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
        return new GetAllRequestDto(
            parseInt(query.pageNumber),
            parseInt(query.pageSize)
        );
    }

    validate(): DtoValidationResult<any> {
        return GetAllRequestDto.validate(GetAllRequestSchema, {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
        });
    }
}
