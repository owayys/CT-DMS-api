import { TagEntity } from "./tag.entity";
import {
    CreateDocumentProps,
    UpdateDocumentProps,
    UserDefinedMetadata,
} from "../../types/document.types";
import { AutoUpdate } from "../../../lib/util/auto-update.util";
import { DocumentMetadata } from "../../value-objects/document-metadata.value-object";
import { TagCollection } from "./tag-collection.entity";
import {
    AggregateRoot,
    handleZodErr,
    SerializedEntity,
    ZodUtils,
} from "@carbonteq/hexapp";
import { DocumentEntitySchema } from "./schemas/document.schema";

export interface IDocument {
    ownerId: string;
    fileName: string;
    fileExtension: string;
    content: string;
    contentType: string;
    tags: {
        key: string;
        name: string;
    }[];
    meta?: DocumentMetadata;
}

export class DocumentEntity extends AggregateRoot implements IDocument {
    private _userId: string;
    private _fileName: string;
    private _fileExtension: string;
    private _content: string;
    private _contentType: string;
    private _tags: TagCollection;
    private _meta?: DocumentMetadata;

    constructor(
        userId: string,
        fileName: string,
        fileExtension: string,
        content: string,
        contentType: string,
        tags: { key: string; name: string }[],
        meta?: DocumentMetadata
    ) {
        super();
        this._userId = userId;
        this._fileName = fileName;
        this._fileExtension = fileExtension;
        this._content = content;
        this._contentType = contentType;
        this._tags = TagCollection.create({ tags });
        this._meta = meta;
    }

    static create(create: CreateDocumentProps) {
        const {
            userId,
            fileName,
            fileExtension,
            content,
            contentType,
            tags,
            meta,
        } = create;

        const guard = ZodUtils.safeParseResult(
            DocumentEntitySchema,
            {
                ownerId: userId,
                fileName,
                fileExtension,
                content,
                contentType,
                tags,
                meta,
            },
            handleZodErr
        );

        if (guard.isOk()) {
            return new DocumentEntity(
                userId,
                fileName,
                fileExtension,
                content,
                contentType,
                tags,
                DocumentMetadata.fromData(meta)
            );
        } else {
            throw guard.unwrapErr();
        }
    }

    static fromSerialized(other: Readonly<SerializedEntity & IDocument>) {
        const ent = new DocumentEntity(
            other.ownerId,
            other.fileName,
            other.fileExtension,
            other.content,
            other.contentType,
            other.tags,
            other.meta
        );

        ent._fromSerialized(other);

        return ent;
    }

    get ownerId(): string {
        return this._userId;
    }

    get fileName(): string {
        return this._fileName;
    }

    get fileExtension(): string {
        return this._fileExtension;
    }

    get content(): string {
        return this._content;
    }

    get contentType(): string {
        return this._contentType;
    }

    get tags(): TagEntity[] {
        return this._tags.tags;
    }

    get meta(): DocumentMetadata | undefined {
        return this._meta;
    }

    @AutoUpdate()
    public addTag(tag: { key: string; name: string }): void {
        this._tags.addTag(tag);
    }

    @AutoUpdate()
    public updateTag(tag: { key: string; name: string }): void {
        this._tags.updateTag(tag);
    }

    @AutoUpdate()
    public deleteTag(key: string): void {
        this._tags.deleteTag(key);
    }

    @AutoUpdate()
    public updateMeta(meta: UserDefinedMetadata): void {
        this._meta = DocumentMetadata.fromData(meta);
    }

    @AutoUpdate()
    public deleteMeta(): void {
        this._meta = undefined;
    }

    @AutoUpdate()
    public update(update: UpdateDocumentProps) {
        this._fileName = update.fileName;
        this._fileExtension = update.fileExtension;
        this._contentType = update.contentType;
        this._tags = TagCollection.create({ tags: update.tags });
        this._content = update.content;
    }

    validate(): void {}

    serialize(): IDocument & SerializedEntity {
        const {
            ownerId,
            id,
            createdAt,
            updatedAt,
            fileName,
            fileExtension,
            content,
            contentType,
            tags,
            meta,
        } = this;
        return {
            ownerId,
            id,
            createdAt,
            updatedAt,
            fileName,
            fileExtension,
            content,
            contentType,
            tags,
            meta,
        };
    }
}
