import { TagEntity } from "./tag.entity";
import { UUID } from "../value-objects/uuid.value-object";
import {
    CreateDocumentProps,
    DocumentProps,
    UpdateDocumentProps,
} from "../types/document.types";
import { Timestamp } from "../value-objects/timestamp.value-object";
import { AggregateRoot } from "../../lib/ddd/aggregate-root.base";
import { AutoUpdate } from "../../lib/util/auto-update.util";
import { DocumentMetadata } from "../value-objects/document-metadata.value-object";
import { DocumentInvalidError } from "../exceptions/document.exceptions";
import { TagCollection } from "./tag-collection.entity";

export class DocumentEntity extends AggregateRoot<DocumentProps> {
    static create(create: CreateDocumentProps) {
        const id = UUID.generate();
        const tagCollection = TagCollection.create({ tags: create.tags });
        create.tags.forEach((tag) => {
            tagCollection.addTag(tag);
        });
        const metaData = create.meta
            ? DocumentMetadata.fromData(create.meta)
            : create.meta;
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
        if (!UUID.validate(this.id!.toString())) {
            throw new DocumentInvalidError("Id invalid!");
        }
        if (!UUID.validate(this.props.userId.toString())) {
            throw new DocumentInvalidError("Owner id invalid!");
        }
        if (this.props.meta) {
            if (!DocumentMetadata.validate(this.props.meta.val)) {
                throw new DocumentInvalidError("Metadata invalid");
            }
        }
        if (!Timestamp.validate(this.createdAt.toString())) {
            throw new DocumentInvalidError("Creation time invalid!");
        }
        if (!Timestamp.validate(this.updatedAt.toString())) {
            throw new DocumentInvalidError("Updation time invalid!");
        }
        if (
            typeof this.props.fileName !== "string" ||
            this.props.fileName.length < 1
        ) {
            throw new DocumentInvalidError("File name invalid!");
        }
        if (
            typeof this.props.fileExtension !== "string" ||
            this.props.fileExtension.length < 1
        ) {
            throw new DocumentInvalidError("File extension invalid!");
        }
        if (
            typeof this.props.contentType !== "string" ||
            this.props.contentType.length < 1
        ) {
            throw new DocumentInvalidError("Content type invalid!");
        }
        if (typeof this.props.content !== "string") {
            throw new DocumentInvalidError("Content invalid!");
        }
        this.tags.forEach((tag) => {
            tag.validate();
        });
    }
}
