import { and, eq, gt, sql } from "drizzle-orm";
import {
    DocumentTable,
    DocumentTagsTable,
    DownloadTable,
    TagTable,
} from "../database/schema";
import { IDrizzleConnection } from "./types";
import { IDocumentRepository } from "./IDocumentRepository";
import { unlink } from "fs/promises";
import { UploadedFile } from "express-fileupload";

export class DrizzleDocumentRepository implements IDocumentRepository {
    constructor(private readonly _db: IDrizzleConnection) {}

    async findById(userId: string, documentId: string): Promise<any> {
        const document = await this._db.query.DocumentTable.findFirst({
            where: and(
                eq(DocumentTable.Id, documentId),
                eq(DocumentTable.userId, userId)
            ),
            with: {
                tags: {
                    with: {
                        tag: {
                            columns: {
                                key: true,
                                name: true,
                            },
                        },
                    },
                    columns: {
                        documentId: false,
                        tagId: false,
                    },
                },
            },
        });

        let response;

        if (document) {
            response = {
                Id: document.Id,
                fileName: document.fileName,
                fileExtension: document.fileExtension,
                contentType: document.contentType,
                tags: document.tags.map((tag) => ({
                    key: tag.tag.key,
                    name: tag.tag.name,
                })),
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
            };
        } else {
            response = null;
        }

        return response;
    }

    async all(
        userId: string,
        pageNumber: number = 0,
        pageSize: number = 10,
        tag: string | null = null
    ): Promise<any> {
        let documents = await this._db.query.DocumentTable.findMany({
            where: and(eq(DocumentTable.userId, userId)),
            with: {
                tags: {
                    with: {
                        tag: {
                            columns: {
                                key: true,
                                name: true,
                            },
                        },
                    },
                    columns: {
                        documentId: false,
                        tagId: false,
                    },
                },
            },
        });

        let documentsFlattened = documents.map((doc) => ({
            ...doc,
            tags: doc.tags.map((tag) => ({
                key: tag.tag.key,
                name: tag.tag.name,
            })),
        }));

        if (tag) {
            documentsFlattened = documentsFlattened.filter((doc) =>
                doc.tags.some((someTag) => someTag.name === tag)
            );
        }

        let totalItems = documentsFlattened.length;
        let totalPages = Math.ceil(documentsFlattened.length / pageSize);
        let page = Math.min(totalPages, pageNumber);
        let items = documentsFlattened.slice(
            pageNumber * pageSize,
            pageNumber * pageSize + pageSize
        );
        let size = Math.min(items.length, pageSize);

        return {
            page: page + 1,
            size: size,
            totalPages: totalPages,
            totalItems: totalItems,
            items: items,
        };
    }

    async getContentById(userId: string, documentId: string): Promise<any> {
        return await this._db.transaction(async (tx) => {
            let doc = await tx.query.DocumentTable.findFirst({
                where: and(
                    eq(DocumentTable.Id, documentId),
                    eq(DocumentTable.userId, userId)
                ),
                columns: {
                    content: true,
                },
            });

            if (doc?.content === "FILE_UPLOADED") {
                await tx
                    .delete(DownloadTable)
                    .where(eq(DownloadTable.Id, documentId));

                let download = await tx
                    .insert(DownloadTable)
                    .values({
                        Id: documentId,
                    })
                    .returning({
                        link: DownloadTable.link,
                    });

                return {
                    downloadUrl: `http://localhost:8080/api/v1/document/download?link=${download[0].link}`,
                    isBase64: false,
                };
            } else {
                return doc;
            }
        });
    }

    async save(
        userId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<any> {
        return await this._db.transaction(async (tx) => {
            const [document] = await tx
                .insert(DocumentTable)
                .values({
                    userId: userId,
                    fileName: fileName,
                    fileExtension: fileExtension,
                    contentType: contentType,
                    content: content,
                })
                .returning({
                    Id: DocumentTable.Id,
                    fileName: DocumentTable.fileName,
                    fileExtension: DocumentTable.fileExtension,
                    contentType: DocumentTable.contentType,
                    createdAt: DocumentTable.createdAt,
                    updatedAt: DocumentTable.updatedAt,
                });

            await tx.insert(TagTable).values(tags).onConflictDoNothing({
                target: TagTable.key,
            });

            let docTags = tags.map((tag: { key: string; name: string }) => ({
                documentId: document.Id,
                tagId: tag.key,
            }));

            await tx.insert(DocumentTagsTable).values(docTags);

            return {
                Id: document.Id,
                fileName: document.fileName,
                fileExtension: document.fileExtension,
                contentType: document.contentType,
                tags: tags,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
            };
        });
    }

    async update(
        userId: string,
        documentId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<any> {
        return await this._db.transaction(async (tx) => {
            await tx
                .update(DocumentTable)
                .set({
                    fileName: fileName,
                    fileExtension: fileExtension,
                    contentType: contentType,
                    content: content,
                })
                .where(
                    and(
                        eq(DocumentTable.Id, documentId),
                        eq(DocumentTable.userId, userId)
                    )
                );

            await tx.insert(TagTable).values(tags).onConflictDoNothing({
                target: TagTable.key,
            });

            await tx
                .delete(DocumentTagsTable)
                .where(eq(DocumentTagsTable.documentId, documentId));

            let tagValues = tags.map((tag) => ({
                documentId: documentId,
                tagId: tag.key,
            }));

            await tx.insert(DocumentTagsTable).values(tagValues);

            return {
                success: true,
            };
        });
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<any> {
        console.log(documentId, tag);
        return await this._db.transaction(async (tx) => {
            const [tagResult] = await tx
                .insert(TagTable)
                .values(tag)
                .returning({
                    key: TagTable.key,
                    name: TagTable.name,
                })
                .onConflictDoNothing({
                    target: TagTable.key,
                });

            await tx.insert(DocumentTagsTable).values({
                documentId: documentId,
                tagId: tagResult ? tagResult.key : tag.key,
            });

            return tagResult ? tagResult : tag;
        });
    }

    async download(link: string): Promise<any> {
        let [download] = await this._db
            .select({
                Id: DownloadTable.Id,
                fileName: DocumentTable.fileName,
                fileExtension: DocumentTable.fileExtension,
            })
            .from(DownloadTable)
            .innerJoin(DocumentTable, eq(DownloadTable.Id, DocumentTable.Id))
            .where(
                and(
                    eq(DownloadTable.link, link),
                    gt(DownloadTable.expires, sql`NOW()`)
                )
            )
            .limit(1);

        let response;

        if (download) {
            response = {
                filePath: `./app/uploads/${download.Id}`,
                fileName: `${download.fileName}${download.fileExtension}`,
            };
        } else {
            response = null;
        }

        return response;
    }

    async upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[]
    ): Promise<any> {
        return await this._db.transaction(async (tx) => {
            const [document] = await tx
                .insert(DocumentTable)
                .values({
                    userId: userId,
                    fileName: fileName,
                    fileExtension: fileExtension,
                    contentType: contentType,
                    content: "FILE_UPLOADED",
                })
                .returning({
                    Id: DocumentTable.Id,
                    fileName: DocumentTable.fileName,
                    fileExtension: DocumentTable.fileExtension,
                    contentType: DocumentTable.contentType,
                    createdAt: DocumentTable.createdAt,
                    updatedAt: DocumentTable.updatedAt,
                });

            await tx.insert(TagTable).values(tags).onConflictDoNothing({
                target: TagTable.key,
            });

            let docTags = tags.map((tag: { key: string; name: string }) => ({
                documentId: document.Id,
                tagId: tag.key,
            }));

            await tx.insert(DocumentTagsTable).values(docTags);

            file.mv(`./app/uploads/${document.Id}`, async function (err) {
                if (err) {
                    tx.rollback();
                    return null;
                }
            });

            return document;
        });
    }

    async remove(
        user: {
            Id: string;
            userName: string;
            userRole: string;
        },
        documentId: string
    ): Promise<any> {
        return await this._db.transaction(async (tx) => {
            let doc = await tx.query.DocumentTable.findFirst({
                where: and(
                    eq(DocumentTable.Id, documentId),
                    eq(DocumentTable.userId, user.Id)
                ),
            });

            if (typeof doc !== "undefined" || user.userRole === "ADMIN") {
                await tx
                    .delete(DownloadTable)
                    .where(eq(DownloadTable.Id, documentId));
                await tx
                    .delete(DocumentTagsTable)
                    .where(eq(DocumentTagsTable.documentId, documentId));
                let result = await tx
                    .delete(DocumentTable)
                    .where(eq(DocumentTable.Id, documentId));
                console.log(result);
                try {
                    await unlink(`./app/uploads/${documentId}`);
                    console.log(`Document [${documentId}] was deleted`);
                } catch (err) {
                    console.error(
                        `Error deleting document [${documentId}]`,
                        err.message
                    );
                }

                return {
                    success: true,
                };
            } else {
                return {
                    success: false,
                };
            }
        });
    }
}
