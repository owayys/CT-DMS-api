import { randomUUID } from "crypto";

export class UUID {
    private constructor(private value: string) {
        if (!UUID.validate(value)) {
            console.log(value);
            throw Error("Invalid UUID");
        }
    }

    public static validate(value: string): boolean {
        if (
            /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
                value
            )
        ) {
            return true;
        }
        return false;
    }

    public static generate(): UUID {
        return new UUID(randomUUID());
    }

    public static fromString(value: string): UUID {
        return new UUID(value);
    }

    public equals(other: any): boolean {
        if (other instanceof UUID) {
            return this.value === other.value;
        } else if (typeof other === "string") {
            return this.value === other;
        }
        return false;
    }

    public toString(): string {
        return this.value;
    }
}
