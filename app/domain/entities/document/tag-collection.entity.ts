import { BaseEntity } from "@carbonteq/hexapp";
import { AutoUpdate } from "../../../lib/util/auto-update.util";
import { CreateTagCollectionProps } from "../../types/tag-collection.types";
import { TagEntity } from "./tag.entity";

export interface ITagCollection {
    tags: {
        key: string;
        name: string;
    }[];
}

export class TagCollection extends BaseEntity implements ITagCollection {
    private _tags: Map<string, TagEntity>;
    constructor(tags: TagEntity[]) {
        super();
        this._tags = new Map();
        tags.forEach((tag) => {
            this._tags.set(tag.key, TagEntity.create(tag));
        });
    }
    static create(create: CreateTagCollectionProps) {
        const tags = create.tags.map(TagEntity.create);
        return new TagCollection(tags);
    }

    public includes(key: string): boolean {
        return this._tags.has(key);
    }

    @AutoUpdate()
    public addTag(tag: { key: string; name: string }): void {
        let newTag = TagEntity.create(tag);
        this.includes(newTag.key) ? null : this._tags.set(newTag.key, newTag);
    }

    @AutoUpdate()
    public updateTag(tag: { key: string; name: string }): void {
        if (this.includes(tag.key)) {
            const entity = this._tags.get(tag.key);
            entity!.update(tag.name);
        }
    }

    @AutoUpdate()
    public deleteTag(key: string): void {
        this._tags.delete(key);
    }

    get tags(): TagEntity[] {
        return Array.from(this._tags.values());
    }

    validate(): void {}

    serialize() {}
}
