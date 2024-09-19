import { Entity } from "../../lib/ddd/entity.base";
import { AutoUpdate } from "../../lib/util/auto-update.util";
import { CreateTagProps, TagProps } from "../types/tag.types";

export class TagEntity extends Entity<TagProps> {
    static create(create: CreateTagProps) {
        const props: TagProps = create;
        const tag = new TagEntity({ props });
        return tag;
    }

    get key() {
        return this.props.key;
    }

    get name() {
        return this.props.name;
    }

    @AutoUpdate()
    public update(updatedName: string) {
        this.props.name = updatedName;
    }

    public toString() {
        return `{
            key: ${this.props.key},
            name: ${this.props.name}
        }`;
    }

    validate(): void {
        if (typeof this.props.key !== "string" || this.props.key.length < 1) {
            throw Error("Tag key invalid!");
        }
        if (typeof this.props.name !== "string" || this.props.name.length < 1) {
            throw Error("Tag name invalid!");
        }
    }
}
