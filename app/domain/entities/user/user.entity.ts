import {
    AggregateRoot,
    handleZodErr,
    SerializedEntity,
    ZodUtils,
} from "@carbonteq/hexapp";
import { AutoUpdate } from "../../../lib/util/auto-update.util";
import { CreateUserProps } from "../../types/user.types";
import { UserPassword } from "../../value-objects/user-password.value-object";
import { UserRole } from "../../value-objects/user-role.value-object";
import { UserEntitySchema } from "./user.schema";

export interface IUser {
    userName: string;
    role: UserRole;
    password: UserPassword;
}

export class UserEntity extends AggregateRoot implements IUser {
    private _userName: string;
    private _role: UserRole;
    private _password: UserPassword;

    constructor(userName: string, role: string, password: string) {
        super();
        this._userName = userName;
        this._role = new UserRole(role);
        this._password = UserPassword.validate(password)
            ? UserPassword.fromHash(password)
            : UserPassword.fromPlain(password);
    }

    static create(create: CreateUserProps): UserEntity {
        const userName = create.userName;
        const password = create.password;
        const userRole = "USER";

        const guard = ZodUtils.safeParseResult(
            UserEntitySchema,
            {
                userName,
                password: password.toString(),
                role: userRole,
            },
            handleZodErr
        );

        if (guard.isOk()) {
            return new UserEntity(userName, userRole, password);
        } else {
            throw guard.unwrapErr();
        }
    }

    static fromSerialized(other: Readonly<SerializedEntity & IUser>) {
        const ent = new UserEntity(
            other.userName,
            other.role.toString(),
            other.password.toString()
        );

        ent._fromSerialized(other);
        return ent;
    }

    get userId(): string {
        return this.id;
    }

    get userName(): string {
        return this._userName;
    }

    get role(): UserRole {
        return this._role;
    }

    get password(): UserPassword {
        return this._password;
    }

    public isAdmin(): boolean {
        return this._role.isAdmin();
    }

    public isUser(): boolean {
        return this._role.isUser();
    }

    public async validatePassword(plain: string): Promise<boolean> {
        return await this._password.compare(plain);
    }

    @AutoUpdate()
    public changePassword(plain: string): void {
        this._password = UserPassword.fromPlain(plain);
    }

    validate(): void {}

    serialize(): IUser & SerializedEntity {
        const { id, createdAt, updatedAt, userName, role, password } = this;
        return {
            id,
            createdAt,
            updatedAt,
            userName,
            role,
            password,
        };
    }
}
