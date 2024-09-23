import { TagEntity } from "./tag.entity";
import {
    CreateDocumentProps,
    DocumentProps,
    UpdateDocumentProps,
} from "../types/document.types";
// import { AggregateRoot } from "../../lib/ddd/aggregate-root.base";
import { AutoUpdate } from "../../lib/util/auto-update.util";
import { DocumentMetadata } from "../value-objects/document-metadata.value-object";
import { TagCollection } from "./tag-collection.entity";
import { EntityInvalidError } from "../../lib/exceptions/exceptions";
import { AggregateRoot, SerializedEntity } from "@carbonteq/hexapp";

const CONTENT_TYPES = [
    "image/png",
    "image/gif",
    "application/pdf",
    "audio/mpeg",
    "video/mp4",
    "text/plain",
];

const FILE_EXTENSIONS = [".png", ".gif", ".pdf", ".mp3", ".mp4", ".txt"];

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
        return new DocumentEntity(
            userId,
            fileName,
            fileExtension,
            content,
            contentType,
            tags,
            DocumentMetadata.fromData(meta)
        );
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
        return this._meta ?? undefined;
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
    public update(update: UpdateDocumentProps) {
        this._fileName = update.fileName;
        this._fileExtension = update.fileExtension;
        this._contentType = update.contentType;
        update.tags.map(this._tags.updateTag);
        this._content = update.content;
    }

    validate(): void {
        if (!CONTENT_TYPES.includes(this.contentType)) {
            throw new EntityInvalidError("Invalid Document content type");
        }
        if (!FILE_EXTENSIONS.includes(this.fileExtension)) {
            throw new EntityInvalidError("Invalid Document extension");
        }
    }

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
