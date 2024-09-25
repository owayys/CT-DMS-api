import { UserDefinedMetadata } from "../../../domain/types/document.types";
import { ResponseBase } from "../../../lib/api/response.base";
import { DocumentResponseSchema } from "./schemas/document.response.schema";

export class DocumentResponseDto extends ResponseBase {
    readonly userId: string;
    readonly fileName: string;
    readonly fileExtension: string;
    readonly contentType: string;
    readonly content: string;
    readonly meta?: UserDefinedMetadata;
    readonly tags: {
        readonly key: string;

        readonly name: string;
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
