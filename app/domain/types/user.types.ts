import { UserPassword } from "../value-objects/user-password.value-object";
import { UserRole } from "../value-objects/user-role.value-object";

export type UserProps = {
    userName: string;
    role: UserRole;
    password: UserPassword;
};

export type CreateUserProps = {
    userName: string;
    password: string;
};

export class RegisterUserCommand {
    userName: string;
    password: string;
}

export class LoginUserCommand {
    userName: string;
    password: string;
}

export class DeleteUserCommand {
    Id: string;
}
