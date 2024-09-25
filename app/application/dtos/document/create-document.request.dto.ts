import { UserDefinedMetadata } from "../../../domain/types/document.types";
import { CreateDocumentRequestSchema } from "./schemas/create-document.request.schema";
import { RequestBase } from "../../../lib/api/request.base";

export class CreateDocumentRequestDto extends RequestBase {
    protected constructor(
        readonly fileName: string,
        readonly fileExtension: string,
        readonly content: string,
        readonly contentType: string,
        readonly tags: {
            readonly key: string;

            readonly name: string;
        }[],
        readonly meta?: UserDefinedMetadata
    ) {
        super();
    }

    static override fromBody(
        body: any,
        _query: any,
        _params: any
    ): RequestBase {
        return new CreateDocumentRequestDto(
            body.fileName,
            body.fileExtension,
            body.content,
            body.contentType,
            body.tags,
            body.meta
        );
    }

    validate() {
        return CreateDocumentRequestDto.validate(CreateDocumentRequestSchema, {
            fileName: this.fileName,
            fileExtension: this.fileExtension,
            content: this.content,
            contentType: this.contentType,
            meta: this.meta,
            tags: this.tags,
        });
    }
}
