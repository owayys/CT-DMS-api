import { BaseValueObject } from "@carbonteq/hexapp";
import { UserDefinedMetadata } from "../types/document.types";

export class DocumentMetadata extends BaseValueObject<UserDefinedMetadata> {
    private _value: any;
    private constructor(value: any) {
        if (!DocumentMetadata.isMetadata(value)) {
            console.log(value, value instanceof DocumentMetadata);
            throw Error("Invalid Metadata");
        }
        super();
        this._value = value;
    }

    static fromData(data: any): DocumentMetadata {
        return data === undefined ? data : new DocumentMetadata(data);
    }

    get value(): UserDefinedMetadata {
        return this._value;
    }

    private static isMetadata(data: any): boolean {
        if (
            !(
                null !== data &&
                typeof data === "object" &&
                Object.getPrototypeOf(data).isPrototypeOf(Object)
            )
        ) {
            return false;
        }

        return Object.values(data).every((value) => {
            return (
                DocumentMetadata.isPrimitive(value) ||
                (Array.isArray(value) &&
                    DocumentMetadata.isValidArray(value)) ||
                DocumentMetadata.isMetadata(value)
            );
        });
    }

    private static isPrimitive(value: any): boolean {
        return (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        );
    }

    private static isValidArray(value: any[]): boolean {
        return value.every((item) => {
            return (
                DocumentMetadata.isPrimitive(item) ||
                (Array.isArray(item) && DocumentMetadata.isValidArray(item)) ||
                DocumentMetadata.isMetadata(item)
            );
        });
    }

    static validate(value: any): boolean {
        return DocumentMetadata.isMetadata(value);
    }

    serialize(): UserDefinedMetadata {
        const { value } = this;
        return { value };
    }
}
