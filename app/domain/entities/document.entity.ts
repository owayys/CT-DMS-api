import { TagEntity } from "./tag.entity";
import { UUID } from "../value-objects/uuid.value-object";
import {
    CreateDocumentProps,
    UserDefinedMetadata,
    DocumentProps,
    UpdateDocumentProps,
} from "../types/document.types";
import { Timestamp } from "../value-objects/timestamp.value-object";
import { AggregateRoot } from "../../lib/ddd/aggregate-root.base";
import { AutoUpdate } from "../../lib/util/auto-update.util";

export class DocumentEntity extends AggregateRoot<
    DocumentProps<UserDefinedMetadata>
> {
    static create(create: CreateDocumentProps<UserDefinedMetadata>) {
        const id = UUID.generate();
        const tagList = create.tags.map((tag) => {
            return TagEntity.create({ key: tag.key, name: tag.name });
        });
        const props: DocumentProps<UserDefinedMetadata> = {
            ...create,
            tags: tagList,
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
        return Array.from(this.props.tags.values());
    }

    get meta(): UserDefinedMetadata | null {
        return this.props.meta ?? null;
    }

    @AutoUpdate()
    public addTag(tag: TagEntity): void {
        this.props.tags.push(tag);
    }

    @AutoUpdate()
    public updateTag(tag: TagEntity): void {
        const currentTag = this.props.tags.find((t) => t.key === tag.key);
        currentTag?.update(tag.name);
    }

    @AutoUpdate()
    public deleteTag(key: string): void {
        this.props.tags = this.props.tags.filter((t) => t.key !== key);
    }

    @AutoUpdate()
    public update(update: UpdateDocumentProps) {
        this.props.fileName = update.fileName;
        this.props.fileExtension = update.fileExtension;
        this.props.contentType = update.contentType;
        this.props.tags = update.tags.map((tag) => {
            return TagEntity.create({ key: tag.key, name: tag.name });
        });
        this.props.content = update.content;
    }

    validate(): void {
        if (!UUID.validate(this.id!.toString())) {
            throw Error("Document id invalid!");
        }
        if (!UUID.validate(this.props.userId.toString())) {
            throw Error("Document owner id invalid!");
        }
        if (!Timestamp.validate(this.createdAt.toString())) {
            throw Error("Document creation time invalid!");
        }
        if (!Timestamp.validate(this.updatedAt.toString())) {
            throw Error("Document updation time invalid!");
        }
        if (
            typeof this.props.fileName !== "string" ||
            this.props.fileName.length < 1
        ) {
            throw Error("Document file name invalid!");
        }
        if (
            typeof this.props.fileExtension !== "string" ||
            this.props.fileExtension.length < 1
        ) {
            throw Error("Document file extension invalid!");
        }
        if (
            typeof this.props.contentType !== "string" ||
            this.props.contentType.length < 1
        ) {
            throw Error("Document content type invalid!");
        }
        if (typeof this.props.content !== "string") {
            throw Error("Document content invalid!");
        }
        this.tags.forEach((tag) => {
            tag.validate();
        });
    }
}
