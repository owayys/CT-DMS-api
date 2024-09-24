// @ts-nocheck

import { expect } from "chai";
import { UserEntity } from "../../app/domain/entities/user/user.entity";
import { ValidationError } from "@carbonteq/hexapp";

describe("User Entity", () => {
    const userName = "testUser";
    const password = "testPassword";
    const anotherPassword = "anotherPassword";

    const user = UserEntity.create({
        userName,
        password,
    });

    // TODO
    describe("Input guarding", () => {
        it("should only accept string as `userName`", () => {
            let testNumber = () => {
                UserEntity.create({
                    userName: 5,
                    password,
                });
            };
            let testBoolean = () => {
                UserEntity.create({
                    userName: true,
                    password,
                });
            };
            let testNull = () => {
                UserEntity.create({
                    userName: null,
                    password,
                });
            };
            let testString = () => {
                UserEntity.create({
                    userName: "string",
                    password,
                });
            };
            expect(testNumber).throw(ValidationError);
            expect(testBoolean).throw(ValidationError);
            expect(testNull).throw(ValidationError);
            expect(testString).to.not.throw(ValidationError);
        });
        it("should only accept string as `password`", () => {
            let testNumber = () => {
                UserEntity.create({
                    userName,
                    password: 5,
                });
            };
            let testBoolean = () => {
                UserEntity.create({
                    userName,
                    password: true,
                });
            };
            let testNull = () => {
                UserEntity.create({
                    userName,
                    password: null,
                });
            };
            let testString = () => {
                UserEntity.create({
                    userName,
                    password: "string",
                });
            };
            expect(testNumber).throw(Error);
            expect(testBoolean).throw(Error);
            expect(testNull).throw(Error);
            expect(testString).to.not.throw(Error);
        });
    });
    describe("Auto renew updation time", () => {
        it("createdAt equals updatedAt before update", () => {
            expect(user.createdAt.getTime()).to.equal(user.updatedAt.getTime());
        });
        it("updatedAt is greater than createdAt after update", () => {
            user.changePassword(password);
            expect(user.createdAt.getTime()).to.lessThan(
                user.updatedAt.getTime()
            );
            expect(user.updatedAt.getTime()).to.greaterThan(
                user.createdAt.getTime()
            );
        });
    });
    describe("Role validation", () => {
        it("should be USER", () => {
            expect(user.isUser()).to.equal(true);
        });
        it("should not be ADMIN", () => {
            expect(user.isAdmin()).to.equal(false);
        });
    });
    describe("Password validations", () => {
        it("compare password", async () => {
            expect(await user.password.compare(password)).to.equal(
                true,
                "should return true for correct password"
            );

            expect(await user.password.compare(anotherPassword)).to.equal(
                false,
                "should return false for incorrect password"
            );
        });
        it("change password", async () => {
            user.changePassword(anotherPassword);
            expect(await user.password.compare(anotherPassword)).to.equal(
                true,
                "should return true for correct password"
            );

            expect(await user.password.compare(password)).to.equal(
                false,
                "should return false for incorrect password"
            );
        });
    });
});
