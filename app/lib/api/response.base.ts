import { BaseDto } from "@carbonteq/hexapp";

export interface BaseResponseProps {
    Id?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ResponseBase extends BaseDto {
    constructor(props: BaseResponseProps) {
        super();
        if (props.Id) {
            this.Id = props.Id;
        }
        this.createdAt = new Date(props.createdAt).toISOString();
        this.updatedAt = new Date(props.updatedAt).toISOString();
    }
    readonly Id: string;
    readonly createdAt: string;
    readonly updatedAt: string;
}
