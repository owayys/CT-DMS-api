import { AggregateRoot } from "../../lib/ddd/aggregate-root.base";
import { AutoUpdate } from "../../lib/util/auto-update.util";
import { CreateUserProps, UserProps } from "../types/user.types";
import { UserPassword } from "../value-objects/user-password.value-object";
import { UserRole } from "../value-objects/user-role.value-object";
import { UUID } from "../value-objects/uuid.value-object";

export class UserEntity extends AggregateRoot<UserProps> {
    static create(create: CreateUserProps): UserEntity {
        const id = UUID.generate();
        const password = UserPassword.fromPlain(create.password);
        const userRole = new UserRole("USER" as string);
        const props: UserProps = {
            ...create,
            role: userRole,
            password: password,
        };
        const user = new UserEntity({
            id,
            props,
        });
        return user;
    }

    get userName(): string {
        return this.props.userName;
    }

    get role(): UserRole {
        return this.props.role;
    }

    get password(): string {
        return this.props.password.toString();
    }

    public isAdmin(): boolean {
        return this.props.role.isAdmin();
    }

    public isUser(): boolean {
        return this.props.role.isUser();
    }

    public async validatePassword(plain: string): Promise<boolean> {
        return await this.props.password.compare(plain);
    }

    @AutoUpdate()
    public changePassword(plain: string): void {
        this.props.password = UserPassword.fromPlain(plain);
    }

    validate(): void {}
}
