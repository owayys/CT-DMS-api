import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { GetAllDocumentsRequestSchema } from "./schemas/get-all-documents.request.schema";
export class GetAllDocumentsRequestDto extends RequestBase {
    protected constructor(
        readonly pageNumber: number,
        readonly pageSize: number,
        readonly filterBy?: any
    ) {
        super();
    }

    static override fromBody(body: any, query: any, _params: any): RequestBase {
        return new GetAllDocumentsRequestDto(
            parseInt(query.pageNumber),
            parseInt(query.pageSize),
            body.filterBy
        );
    }

    validate(): DtoValidationResult<any> {
        return GetAllDocumentsRequestDto.validate(
            GetAllDocumentsRequestSchema,
            {
                pageNumber: this.pageNumber,
                pageSize: this.pageSize,
                filterBy: this.filterBy,
            }
        );
    }
}
