import {
    BaseEntity,
    handleZodErr,
    SerializedEntity,
    ZodUtils,
} from "@carbonteq/hexapp";
import { AutoUpdate } from "../../../lib/util/auto-update.util";
import { CreateTagProps } from "../../types/tag.types";
import { TagEntitySchema } from "./schemas/tag.schema";

export interface ITag {
    key: string;
    name: string;
}

export class TagEntity extends BaseEntity implements ITag {
    private _key: string;
    private _name: string;

    constructor(key: string, name: string) {
        super();
        this._key = key;
        this._name = name;
    }

    static create(create: CreateTagProps) {
        const { key, name } = create;
        const guard = ZodUtils.safeParseResult(
            TagEntitySchema,
            {
                key,
                name,
            },
            handleZodErr
        );

        if (guard.isOk()) {
            return new TagEntity(key, name);
        } else {
            throw guard.unwrapErr();
        }
    }

    static fromSerialized(other: Readonly<SerializedEntity & ITag>) {
        const ent = new TagEntity(other.key, other.name);

        ent._fromSerialized(other);

        return ent;
    }

    get key() {
        return this._key;
    }

    get name() {
        return this._name;
    }

    @AutoUpdate()
    public update(updatedName: string) {
        this._name = updatedName;
    }

    public toString() {
        return `{
            key: ${this._key},
            name: ${this._name}
        }`;
    }

    validate(): void {}

    serialize() {
        const { id, createdAt, updatedAt, key, name } = this;
        return { id, createdAt, updatedAt, key, name };
    }
}
