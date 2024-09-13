export class Timestamp {
    private value: string;

    constructor(value?: string) {
        if (value) {
            this.value = value;
        } else {
            this.value = this.getCurrent();
        }
    }

    public static validate(timestamp: string): boolean {
        if (new Date(timestamp).getTime() > new Date().getTime()) {
            return false;
        }
        if (
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{3}$/.test(timestamp) ||
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{3,6}$/.test(
                timestamp.replace(/T/, " ").replace(/Z/, "")
            )
        ) {
            return true;
        }
        return false;
    }

    private getCurrent(): string {
        return new Date().toISOString().replace(/T/, " ").replace(/Z/, "");
    }

    public update(): void {
        this.value = this.getCurrent();
    }

    public static fromString(value: string): Timestamp {
        return new Timestamp(value);
    }

    public toString(): string {
        return this.value;
    }
}
