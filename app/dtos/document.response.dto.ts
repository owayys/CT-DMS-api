import { UserDefinedMetadata } from "../domain/types/document.types";
import { ResponseBase } from "../lib/api/response.base";

export class DocumentResponseDto extends ResponseBase {
    userId: string;
    fileName: string;
    fileExtension: string;
    contentType: string;
    content: string;
    meta?: UserDefinedMetadata;
    tags: {
        key: string;
        name: string;
    }[];
}
