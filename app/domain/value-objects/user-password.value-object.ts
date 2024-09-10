import bcrypt from "bcrypt";

export class UserPassword {
    private constructor(private value: string) {
        if (!UserPassword.validate(value)) {
            throw Error("Invalid Hash");
        }
    }

    public static validate(hash: string): boolean {
        if (/^\$2[aby]?\$\d{1,2}\$[.\/A-Za-z0-9]{53}$/.test(hash)) {
            return true;
        }
        return false;
    }

    public static fromPlain(plain: string): UserPassword {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(plain, salt);
        return new UserPassword(hash);
    }

    public static fromHash(hash: string): UserPassword {
        return new UserPassword(hash);
    }

    public async compare(plain: string): Promise<boolean> {
        return bcrypt.compare(plain, this.value);
    }

    public toString(): string {
        return this.value;
    }
}
