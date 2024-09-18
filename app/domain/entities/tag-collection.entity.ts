import { Entity } from "../../lib/ddd/entity.base";
import { AutoUpdate } from "../../lib/util/auto-update.util";
import {
    CreateTagCollectionProps,
    TagCollectionProps,
} from "../types/tag-collection.types";
import { TagEntity } from "./tag.entity";

export class TagCollection extends Entity<TagCollectionProps> {
    static create(create: CreateTagCollectionProps) {
        const collection: Map<string, TagEntity> = new Map();
        create.tags.forEach((tag) => {
            let tagEntity = TagEntity.create(tag);
            collection.set(tag.key, tagEntity);
        });
        const props: TagCollectionProps = { ...create, tags: collection };
        return new TagCollection({ props });
    }

    public includes(key: string): boolean {
        return this.props.tags.has(key);
    }

    @AutoUpdate()
    public addTag(tag: { key: string; name: string }): void {
        let newTag = TagEntity.create(tag);
        this.includes(newTag.key)
            ? null
            : this.props.tags.set(newTag.key, newTag);
    }

    @AutoUpdate()
    public updateTag(tag: { key: string; name: string }): void {
        if (this.includes(tag.key)) {
            const entity = this.props.tags.get(tag.key);
            entity!.update(tag.name);
        }
    }

    @AutoUpdate()
    public deleteTag(key: string): void {
        this.props.tags.delete(key);
    }

    get values(): TagEntity[] {
        return Array.from(this.props.tags.values());
    }

    validate(): void {}
}
