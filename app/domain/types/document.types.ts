import { TagEntity } from "../entities/tag.entity";
import { UUID } from "../value-objects/uuid.value-object";

export type DocumentProps<T extends UserDefinedMetadata> = {
    userId: UUID;
    fileName: string;
    fileExtension: string;
    content: string;
    contentType: string;
    tags: TagEntity[];
    meta?: T;
};

export type CreateDocumentProps<T extends UserDefinedMetadata> = {
    userId: UUID;
    fileName: string;
    fileExtension: string;
    content: string;
    contentType: string;
    tags: {
        key: string;
        name: string;
    }[];
    meta?: T;
};

export type MetadataTypes = string | number | boolean | UserDefinedMetadata;

export type UserDefinedMetadata = {
    [key: string]:
        | MetadataTypes
        | MetadataTypes[]
        | UserDefinedMetadata
        | UserDefinedMetadata[];
};

export type UpdateDocumentProps = Omit<
    DocumentProps<UserDefinedMetadata>,
    "userId"
>;
