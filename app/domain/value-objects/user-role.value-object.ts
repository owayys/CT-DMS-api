export const USER_ROLES = ["ADMIN", "USER"];

export class UserRole {
    constructor(private value: string) {
        if (!UserRole.validate(value)) {
            throw Error("Invalid Role");
        }
    }

    public static validate(role: string) {
        return USER_ROLES.includes(role);
    }

    public static fromString(value: string): UserRole {
        return new UserRole(value);
    }

    public isAdmin(): boolean {
        return this.value == "ADMIN";
    }

    public isUser(): boolean {
        return this.value == "USER";
    }

    public toString(): string {
        return this.value;
    }
}
