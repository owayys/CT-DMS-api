import { BaseDto, DtoValidationResult } from "@carbonteq/hexapp";

export type RequestDTOBase = {
    fromBody(body: any, query: any, params: any): RequestBase;
};

export abstract class RequestBase extends BaseDto {
    protected constructor() {
        super();
    }
    static fromBody(body: any, query: any, params: any): RequestBase {
        throw new Error("Method not implemented in derived class!");
    }
    abstract validate(): DtoValidationResult<any>;
}
