import { TagEntity } from "./tag.entity";
import { UUID } from "../value-objects/uuid.value-object";
import {
    CreateDocumentProps,
    DocumentProps,
    UpdateDocumentProps,
} from "../types/document.types";
import { AggregateRoot } from "../../lib/ddd/aggregate-root.base";
import { AutoUpdate } from "../../lib/util/auto-update.util";
import { DocumentMetadata } from "../value-objects/document-metadata.value-object";
import { TagCollection } from "./tag-collection.entity";
import { EntityInvalidError } from "../../lib/exceptions/exceptions";

const CONTENT_TYPES = [
    "image/png",
    "image/gif",
    "application/pdf",
    "audio/mpeg",
    "video/mp4",
    "text/plain",
];

const FILE_EXTENSIONS = [".png", ".gif", ".pdf", ".mp3", ".mp4", ".txt"];

export class DocumentEntity extends AggregateRoot<DocumentProps> {
    static create(create: CreateDocumentProps) {
        const id = UUID.generate();
        const tagCollection = TagCollection.create({ tags: create.tags });
        create.tags.forEach((tag) => {
            tagCollection.addTag(tag);
        });
        const metaData = create.meta
            ? DocumentMetadata.fromData(create.meta)
            : undefined;
        const props: DocumentProps = {
            ...create,
            tags: tagCollection,
            meta: metaData,
        };
        const document = new DocumentEntity({ id, props });
        return document;
    }

    get owner(): UUID {
        return this.props.userId;
    }

    get name(): string {
        return this.props.fileName;
    }

    get extension(): string {
        return this.props.fileExtension;
    }

    get content(): string {
        return this.props.content;
    }

    get contentType(): string {
        return this.props.contentType;
    }

    get tags(): TagEntity[] {
        return this.props.tags.values;
    }

    get meta(): DocumentMetadata | null {
        return this.props.meta ?? null;
    }

    @AutoUpdate()
    public addTag(tag: { key: string; name: string }): void {
        this.props.tags.addTag(tag);
    }

    @AutoUpdate()
    public updateTag(tag: { key: string; name: string }): void {
        this.props.tags.updateTag(tag);
    }

    @AutoUpdate()
    public deleteTag(key: string): void {
        this.props.tags.deleteTag(key);
    }

    @AutoUpdate()
    public update(update: UpdateDocumentProps) {
        this.props.fileName = update.fileName;
        this.props.fileExtension = update.fileExtension;
        this.props.contentType = update.contentType;
        update.tags.map(this.props.tags.updateTag);
        this.props.content = update.content;
    }

    validate(): void {
        if (!CONTENT_TYPES.includes(this.contentType)) {
            throw new EntityInvalidError("Invalid Document content type");
        }
        if (!FILE_EXTENSIONS.includes(this.extension)) {
            throw new EntityInvalidError("Invalid Document extension");
        }
    }
}
