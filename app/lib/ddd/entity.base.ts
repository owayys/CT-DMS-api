import { Timestamp } from "../../domain/value-objects/timestamp.value-object";
import { UUID } from "../../domain/value-objects/uuid.value-object";

export type BaseEntityProps = {
    id?: UUID;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type CreateEntityProps<T> = {
    id?: UUID;
    props: T;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export abstract class Entity<EntityProps> {
    protected readonly _id?: UUID;

    private readonly _createdAt: Timestamp;

    private _updatedAt: Timestamp;

    protected readonly props: EntityProps;

    constructor({
        id,
        createdAt,
        updatedAt,
        props,
    }: CreateEntityProps<EntityProps>) {
        if (id) {
            this._id = id;
        }
        this._createdAt = createdAt || new Timestamp();
        this._updatedAt = updatedAt || new Timestamp();
        this.props = props;
        this.validate();
    }

    get id(): UUID | undefined {
        return this._id ?? undefined;
    }

    get createdAt(): Timestamp {
        return this._createdAt;
    }

    get updatedAt(): Timestamp {
        return this._updatedAt;
    }

    public getProps(): EntityProps & BaseEntityProps {
        const propsCopy = {
            id: this._id,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            ...this.props,
        };
        return Object.freeze(propsCopy);
    }

    public onUpdate(): void {
        this._updatedAt.update();
        this.validate();
    }

    public abstract validate(): void;
}
