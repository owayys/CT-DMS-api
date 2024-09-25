import { DtoValidationResult } from "@carbonteq/hexapp";
import { RequestBase } from "../../../lib/api/request.base";
import { UpdateDocumentRequestSchema } from "./schemas/update-document.request.schema";

export class UpdateDocumentRequestDto extends RequestBase {
    protected constructor(
        readonly fileName: string,
        readonly fileExtension: string,
        readonly content: string,
        readonly contentType: string,
        readonly tags: {
            readonly key: string;

            readonly name: string;
        }[]
    ) {
        super();
    }

    static override fromBody(
        body: any,
        _query: any,
        _params: any
    ): RequestBase {
        return new UpdateDocumentRequestDto(
            body.fileName,
            body.fileExtension,
            body.content,
            body.contentType,
            body.tags
        );
    }

    validate(): DtoValidationResult<any> {
        return UpdateDocumentRequestDto.validate(UpdateDocumentRequestSchema, {
            fileName: this.fileName,
            fileExtension: this.fileExtension,
            content: this.content,
            contentType: this.contentType,
            tags: this.tags,
        });
    }
}
