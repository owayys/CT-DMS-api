import { TagEntity } from "../entities/tag.entity";
import { UUID } from "../value-objects/uuid.value-object";

export type DocumentProps<T> = {
    userId: UUID;
    fileName: string;
    fileExtension: string;
    content: string;
    contentType: string;
    tags: TagEntity[];
    meta?: { [Property in keyof T]: T[Property] };
};

export type CreateDocumentProps<T> = {
    userId: UUID;
    fileName: string;
    fileExtension: string;
    content: string;
    contentType: string;
    tags: {
        key: string;
        name: string;
    }[];
    meta?: { [Property in keyof T]: T[Property] };
};

type Primitive = string | boolean | number;

export type UserDefinedMetadata = {
    [key: string]: Primitive | Array<Primitive> | UserDefinedMetadata;
};

export type UpdateDocumentProps = Omit<
    DocumentProps<UserDefinedMetadata>,
    "userId"
>;
