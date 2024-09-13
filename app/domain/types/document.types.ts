import { UploadedFile } from "express-fileupload";
import { TagEntity } from "../entities/tag.entity";
import { UUID } from "../value-objects/uuid.value-object";
import { DocumentEntity } from "../entities/document.entity";
import { DocumentMetadata } from "../value-objects/document-metadata.value-object";

export type DocumentProps = {
    userId: UUID;
    fileName: string;
    fileExtension: string;
    content: string;
    contentType: string;
    tags: TagEntity[];
    meta?: DocumentMetadata;
};

export type CreateDocumentProps = {
    userId: UUID;
    fileName: string;
    fileExtension: string;
    content: string;
    contentType: string;
    tags: {
        key: string;
        name: string;
    }[];
    meta?: any;
};

export type MetadataTypes = string | number | boolean | UserDefinedMetadata;

export type UserDefinedMetadata = {
    [key: string]:
        | MetadataTypes
        | MetadataTypes[]
        | UserDefinedMetadata
        | UserDefinedMetadata[];
};

export type UpdateDocumentProps = Omit<DocumentProps, "userId">;

export class UploadFileCommand {
    id: string;
    file: UploadedFile;
}

export class AuthorizeDocumentAccessCommand {
    userId: string;
    document: DocumentEntity;
}

export class GetDocumentCommand {
    userId: string;
    documentId: string;
}
