import { BaseValueObject } from "@carbonteq/hexapp";
import bcrypt from "bcrypt";
import { CreateUserProps } from "../types/user.types";

export class UserPassword extends BaseValueObject<
    Pick<CreateUserProps, "password">
> {
    private _value: string;
    private constructor(value: string) {
        if (!UserPassword.validate(value)) {
            throw Error("Invalid Hash");
        }
        super();
        this._value = value;
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
        return bcrypt.compare(plain, this._value);
    }

    public toString(): string {
        return this._value;
    }

    serialize(): Pick<CreateUserProps, "password"> {
        const { _value } = this;
        return { password: _value };
    }
}
