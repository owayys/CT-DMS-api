import { UserDefinedMetadata } from "../../../domain/types/document.types";
import { ResponseBase } from "../../../lib/api/response.base";
import { DocumentResponseSchema } from "./schemas/document.response.schema";

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

    validate() {
        return DocumentResponseDto.validate(DocumentResponseSchema, {
            userId: this.userId,
            fileName: this.fileName,
            fileExtension: this.fileExtension,
            contentType: this.contentType,
            content: this.content,
            meta: this.meta,
            tags: this.tags,
        });
    }
}
