// @ts-nocheck

import { expect } from "chai";
import { DocumentEntity } from "../../app/domain/entities/document/document.entity";
import { UserEntity } from "../../app/domain/entities/user/user.entity";
import { UserDefinedMetadata } from "../../app/domain/types/document.types";
import { AppErrStatus, ValidationError } from "@carbonteq/hexapp";
import { AuthorizeDocumentAccessService } from "../../app/domain/services/authorize-document-access.service";

describe("Document Entity", () => {
    const userName = "testUser";
    const password = "testPassword";

    const user = UserEntity.create({
        userName,
        password,
    });

    const userId = user.id;
    const fileName = "testFileName";
    const fileExtension = ".txt";
    const contentType = "text/plain";
    const content = "test file content";
    const tags = [
        {
            key: "1",
            name: "tag1",
        },
        {
            key: "2",
            name: "tag2",
        },
    ];

    const meta = {
        item1: "h",
        item2: 4953952293521149,
        item3: 3,
        item4: {
            item5: [8544131700845257, 5570144997728958],
        },
        item6: [
            "K",
            "Y",
            [
                {
                    item7: "2",
                },
                "G",
                [
                    {
                        item7: "2",
                        item8: [
                            {
                                item7: 2,
                            },
                            "G",
                        ],
                    },
                    false,
                ],
            ],
        ],
    } as UserDefinedMetadata;

    const document = DocumentEntity.create({
        userId,
        fileName,
        fileExtension,
        contentType,
        content,
        tags,
        meta,
    });

    describe("Input guarding", () => {
        it("should only accept valid UUID strings for `ownerId`", () => {
            const testNumber = () => {
                DocumentEntity.create({
                    userId: 1,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta,
                });
            };
            const testBoolean = () => {
                DocumentEntity.create({
                    userId: true,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta,
                });
            };
            const testNull = () => {
                DocumentEntity.create({
                    userId: null,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta,
                });
            };
            const testNonUUIDString = () => {
                DocumentEntity.create({
                    userId: "invalid",
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta,
                });
            };
            const testUUIDString = () => {
                DocumentEntity.create({
                    userId: "4fd6ff2b-e081-428c-a8a6-2736563b9d59",
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta,
                });
            };
            expect(testNumber).throw(ValidationError);
            expect(testBoolean).throw(ValidationError);
            expect(testNull).throw(ValidationError);
            expect(testNonUUIDString).throw(ValidationError);
            expect(testUUIDString).to.not.throw(ValidationError);
        });
        it("should only accept valid inputs for `meta`", () => {
            const testNumber = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta: 1,
                });
            };
            const testBoolean = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta: true,
                });
            };
            const testNull = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta: null,
                });
            };
            const testValidObject = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags,
                    meta: meta,
                });
            };
            expect(testNumber).throw(ValidationError);
            expect(testBoolean).throw(ValidationError);
            expect(testNull).throw(ValidationError);
            expect(testValidObject).to.not.throw(ValidationError);
        });
        it("should only accept valid inputs for `tags`", () => {
            const testNumber = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags: 1,
                    meta,
                });
            };
            const testBoolean = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags: true,
                    meta,
                });
            };
            const testString = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags: "string",
                    meta,
                });
            };
            const testNull = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags: null,
                    meta,
                });
            };
            const testInvalidObject = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags: [{ notKey: "key", notName: "name" }],
                    meta,
                });
            };
            const testValidObject = () => {
                DocumentEntity.create({
                    userId,
                    fileName,
                    fileExtension,
                    contentType,
                    content,
                    tags: [{ key: "key", name: "name" }],
                    meta,
                });
            };
            expect(testNumber).throw(ValidationError);
            expect(testBoolean).throw(ValidationError);
            expect(testString).throw(ValidationError);
            expect(testNull).throw(ValidationError);
            expect(testInvalidObject).throw(ValidationError);
            expect(testValidObject).to.not.throw(ValidationError);
        });
        it("should only accept strings for `fileName`, `fileExtension`, `content`, `contentType`", () => {
            let testNumber = () => {
                DocumentEntity.create({
                    userId,
                    fileName: 1,
                    fileExtension: 1,
                    contentType: 1,
                    content: 1,
                    tags,
                    meta,
                });
            };
            let testBoolean = () => {
                DocumentEntity.create({
                    userId,
                    fileName: true,
                    fileExtension: true,
                    contentType: true,
                    content: true,
                    tags,
                    meta,
                });
            };
            let testNull = () => {
                DocumentEntity.create({
                    userId,
                    fileName: null,
                    fileExtension: null,
                    contentType: null,
                    content: null,
                    tags,
                    meta,
                });
            };
            let testString = () => {
                DocumentEntity.create({
                    userId,
                    fileName: "fileName",
                    fileExtension: "fileExtension",
                    contentType: "contentType",
                    content: "content",
                    tags,
                    meta,
                });
            };
            expect(testNumber).throw(ValidationError);
            expect(testBoolean).throw(ValidationError);
            expect(testNull).throw(ValidationError);
            expect(testString).to.not.throw(ValidationError);
        });
    });
    describe("Tags", () => {
        const newTag = {
            key: "3",
            name: "tag3",
        };
        const updatedTag = {
            key: "3",
            name: "UPDATED tag3",
        };
        describe("Add Tag", () => {
            it("should include new tag", () => {
                document.addTag(newTag);
                const exists = document.tags.some(
                    (tag) => tag.key === newTag.key && tag.name === newTag.name
                );
                expect(exists).to.equal(true);
            });
        });
        describe("Update Tag", () => {
            it("tag should be updated", () => {
                document.updateTag(updatedTag);
                const documentTags = document.tags;
                const exists = documentTags.some(
                    (tag) =>
                        tag.key === updatedTag.key &&
                        tag.name === updatedTag.name
                );
                expect(exists).to.equal(true);
            });
        });
        describe("Delete Tag", () => {
            it("tag should be deleted", () => {
                document.deleteTag(newTag.key);
                const documentTags = document.tags;
                const exists = documentTags.some(
                    (tag) => tag.key === newTag.key && tag.name === newTag.name
                );
                expect(exists).to.equal(false);
            });
        });
    });
    describe("Auth service", () => {
        const authService = new AuthorizeDocumentAccessService();
        it("should not pass for invalid ownership", async () => {
            let result = await authService.execute({
                userId: "4fd6ff2b-e081-428c-a8a6-2736563b9d59",
                document,
            });

            expect(result.isOk()).to.equal(false);
            expect(result.isErr()).to.equal(true);
            expect(result.unwrapErr().status).to.equal(
                AppErrStatus.Unauthorized
            );
        });
        it("should pass for valid ownership", async () => {
            let result = await authService.execute({
                userId,
                document,
            });

            expect(result.isOk()).to.equal(true);
            expect(result.isErr()).to.equal(false);
        });
    });
});
