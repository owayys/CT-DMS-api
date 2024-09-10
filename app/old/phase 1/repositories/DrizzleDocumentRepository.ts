import { and, eq, gt, sql } from "drizzle-orm";
import { DocumentTable, DownloadTable, TagTable } from "../database/schema";
import { IDrizzleConnection } from "../../database/types";
import { IDocumentRepository } from "./IDocumentRepository";
import { unlink } from "fs/promises";
import { UploadedFile } from "express-fileupload";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { DATABASE } from "../lib/di/di.tokens";
import { Inject } from "../lib/di/Inject";
import { Result } from "../lib/util/result";
import { z } from "zod";
import {
    DocumentContentResponse,
    DocumentResponse,
    GetDocumentResponse,
    SaveDocumentResponse,
    TagResponse,
} from "../lib/validators/documentSchemas";
import { DeleteResponse, UpdateResponse } from "../lib/validators/common";
import { stat } from "fs";
import { FgCyan, FgWhite } from "../lib/colors";

type GetDocumentResponse = z.infer<typeof GetDocumentResponse>;
type DocumentResponse = z.infer<typeof DocumentResponse>;
type DocumentContentResponse = z.infer<typeof DocumentContentResponse>;
type SaveDocumentResponse = z.infer<typeof SaveDocumentResponse>;
type UpdateResponse = z.infer<typeof UpdateResponse>;
type TagResponse = z.infer<typeof TagResponse>;
type DeleteResponse = z.infer<typeof DeleteResponse>;

@InjectionTarget()
export class DrizzleDocumentRepository implements IDocumentRepository {
    constructor(@Inject(DATABASE) private _db: IDrizzleConnection) {}

    async findById(
        userId: string,
        documentId: string
    ): Promise<Result<GetDocumentResponse, Error>> {
        try {
            const document = await this._db.query.DocumentTable.findFirst({
                where: and(
                    eq(DocumentTable.Id, documentId),
                    eq(DocumentTable.userId, userId)
                ),
                with: {
                    tags: {
                        columns: {
                            documentId: false,
                        },
                    },
                },
                columns: {
                    userId: false,
                },
            });

            if (document) {
                return new Result<GetDocumentResponse, Error>(document, null);
            } else {
                return new Result<GetDocumentResponse, Error>(
                    null,
                    new Error("Document not found")
                );
            }
        } catch (err) {
            return new Result<GetDocumentResponse, Error>(null, err);
        }
    }

    async all(
        userId: string,
        pageNumber: number = 0,
        pageSize: number = 10,
        tag: string | null = null
    ): Promise<Result<DocumentResponse, Error>> {
        try {
            let documents = await this._db.query.DocumentTable.findMany({
                where: and(eq(DocumentTable.userId, userId)),
                with: {
                    tags: {
                        columns: {
                            documentId: false,
                        },
                    },
                },
            });

            if (tag) {
                documents = documents.filter((doc) =>
                    doc.tags.some((someTag) => someTag.name.includes(tag))
                );
            }

            let totalItems = documents.length;
            let totalPages = Math.ceil(documents.length / pageSize);
            let page = Math.min(totalPages, pageNumber);
            let items = documents.slice(
                pageNumber * pageSize,
                pageNumber * pageSize + pageSize
            );
            let size = Math.min(items.length, pageSize);

            const response = {
                page: page + 1,
                size: size,
                totalPages: totalPages,
                totalItems: totalItems,
                items: items,
            };

            return new Result<DocumentResponse, Error>(response, null);
        } catch (err) {
            return new Result<DocumentResponse, Error>(null, err);
        }
    }

    async getContentById(
        userId: string,
        documentId: string
    ): Promise<Result<DocumentContentResponse, Error>> {
        try {
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

                if (!doc) {
                    return new Result<DocumentContentResponse, Error>(
                        null,
                        new Error("Document not found")
                    );
                }

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

                    const response = {
                        downloadUrl: `http://localhost:8080/api/v1/document/download?link=${download[0].link}`,
                        isBase64: false,
                    };

                    return new Result<DocumentContentResponse, Error>(
                        response,
                        null
                    );
                } else {
                    const response = doc;
                    return new Result<DocumentContentResponse, Error>(
                        response,
                        null
                    );
                }
            });
        } catch (err) {
            return new Result<DocumentContentResponse, Error>(null, err);
        }
    }

    async save(
        userId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<Result<SaveDocumentResponse, Error>> {
        try {
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

                let docTags = tags.map(
                    (tag: { key: string; name: string }) => ({
                        documentId: document.Id,
                        key: tag.key,
                        name: tag.name,
                    })
                );

                const insertedTags = await tx
                    .insert(TagTable)
                    .values(docTags)
                    .onConflictDoNothing({
                        target: [TagTable.documentId, TagTable.key],
                    })
                    .returning({
                        key: TagTable.key,
                        name: TagTable.name,
                    });

                const response = {
                    Id: document.Id,
                    fileName: document.fileName,
                    fileExtension: document.fileExtension,
                    contentType: document.contentType,
                    tags: insertedTags,
                    createdAt: document.createdAt,
                    updatedAt: document.updatedAt,
                };

                return new Result<SaveDocumentResponse, Error>(response, null);
            });
        } catch (err) {
            return new Result<SaveDocumentResponse, Error>(null, err);
        }
    }

    async update(
        userId: string,
        documentId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<Result<UpdateResponse, Error>> {
        try {
            return await this._db.transaction(async (tx) => {
                const [document] = await tx
                    .select()
                    .from(DocumentTable)
                    .where(
                        and(
                            eq(DocumentTable.Id, documentId),
                            eq(DocumentTable.userId, userId)
                        )
                    );

                if (!document) {
                    return new Result<UpdateResponse, Error>(
                        null,
                        new Error("Document not found for current user")
                    );
                }

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

                let docTags = tags.map(
                    (tag: { key: string; name: string }) => ({
                        documentId: documentId,
                        key: tag.key,
                        name: tag.name,
                    })
                );

                await tx.insert(TagTable).values(docTags).onConflictDoNothing({
                    target: TagTable.key,
                });

                const response = {
                    success: true,
                };

                return new Result<UpdateResponse, Error>(response, null);
            });
        } catch (err) {
            console.log(err);
            return new Result<UpdateResponse, Error>(null, err);
        }
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<TagResponse, Error>> {
        try {
            return await this._db.transaction(async (tx) => {
                const [tagResult] = await tx
                    .insert(TagTable)
                    .values({
                        documentId: documentId,
                        key: tag.key,
                        name: tag.name,
                    })
                    .returning({
                        key: TagTable.key,
                        name: TagTable.name,
                    })
                    .onConflictDoNothing({
                        target: [TagTable.documentId, TagTable.key],
                    });

                return tagResult
                    ? new Result<TagResponse, Error>(tagResult, null)
                    : new Result<TagResponse, Error>(tag, null);
            });
        } catch (err) {
            return new Result<TagResponse, Error>(null, err);
        }
    }

    async updateTag(
        documentId: string,
        tag: {
            key: string;
            name: string;
        }
    ): Promise<Result<UpdateResponse, Error>> {
        try {
            await this._db
                .update(TagTable)
                .set({
                    name: tag.name,
                })
                .where(
                    and(
                        eq(TagTable.key, tag.key),
                        eq(TagTable.documentId, documentId)
                    )
                );

            const response = {
                success: true,
            };

            return new Result<UpdateResponse, Error>(response, null);
        } catch (err) {
            return new Result<UpdateResponse, Error>(null, err);
        }
    }

    async removeTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<DeleteResponse, Error>> {
        try {
            await this._db
                .delete(TagTable)
                .where(
                    and(
                        eq(TagTable.key, tag.key),
                        eq(TagTable.documentId, documentId)
                    )
                );

            const response = {
                success: true,
            };

            return new Result<DeleteResponse, Error>(response, null);
        } catch (err) {
            return new Result<DeleteResponse, Error>(null, err);
        }
    }

    async download(link: string): Promise<Result<any, Error>> {
        try {
            let [download] = await this._db
                .select({
                    Id: DownloadTable.Id,
                    fileName: DocumentTable.fileName,
                    fileExtension: DocumentTable.fileExtension,
                })
                .from(DownloadTable)
                .innerJoin(
                    DocumentTable,
                    eq(DownloadTable.Id, DocumentTable.Id)
                )
                .where(
                    and(
                        eq(DownloadTable.link, link),
                        gt(DownloadTable.expires, sql`NOW()`)
                    )
                )
                .limit(1);

            if (download) {
                const response = {
                    filePath: `./app/uploads/${download.Id}`,
                    fileName: `${download.fileName}${download.fileExtension}`,
                };

                return new Result<any, Error>(response, null);
            } else {
                return new Result<any, Error>(
                    null,
                    new Error("Download link expired or invalid")
                );
            }
        } catch (err) {
            return new Result<any, Error>(null, err);
        }
    }

    async upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[]
    ): Promise<Result<GetDocumentResponse, Error>> {
        try {
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

                let docTags = tags.map(
                    (tag: { key: string; name: string }) => ({
                        documentId: document.Id,
                        key: tag.key,
                        name: tag.name,
                    })
                );

                const insertedTags = await tx
                    .insert(TagTable)
                    .values(docTags)
                    .onConflictDoNothing({
                        target: [TagTable.documentId, TagTable.key],
                    })
                    .returning({
                        key: TagTable.key,
                        name: TagTable.name,
                    });

                file.mv(`./app/uploads/${document.Id}`, async function (err) {
                    if (err) {
                        tx.rollback();
                        return null;
                    }
                });

                const response = {
                    ...document,
                    tags: insertedTags,
                };

                return new Result<GetDocumentResponse, Error>(response, null);
            });
        } catch (err) {
            return new Result<GetDocumentResponse, Error>(null, err);
        }
    }

    async remove(
        user: {
            Id: string;
            userName: string;
            userRole: string;
        },
        documentId: string
    ): Promise<Result<DeleteResponse, Error>> {
        try {
            return await this._db.transaction(async (tx) => {
                let doc = await tx.query.DocumentTable.findFirst({
                    where: and(
                        eq(DocumentTable.Id, documentId),
                        eq(DocumentTable.userId, user.Id)
                    ),
                });

                if (!doc) {
                    return new Result<DeleteResponse, Error>(
                        null,
                        new Error("Document not found")
                    );
                }

                if (typeof doc !== "undefined" || user.userRole === "ADMIN") {
                    await tx
                        .delete(DownloadTable)
                        .where(eq(DownloadTable.Id, documentId));
                    await tx
                        .delete(TagTable)
                        .where(eq(TagTable.documentId, documentId));
                    await tx
                        .delete(DocumentTable)
                        .where(eq(DocumentTable.Id, documentId));
                    try {
                        stat(
                            `./app/uploads/${documentId}`,
                            async (err, stats) => {
                                if (err && err.code !== "ENOENT") {
                                    console.error(
                                        `Error deleting document [${FgCyan}${documentId}${FgWhite}]`,
                                        err.message
                                    );
                                } else if (stats && stats.isFile()) {
                                    await unlink(`./app/uploads/${documentId}`);
                                    console.log(
                                        `Document [${FgCyan}${documentId}${FgWhite}] was deleted`
                                    );
                                }
                            }
                        );
                    } catch (err) {
                        console.error(
                            `Error deleting document [${documentId}]`,
                            err.message
                        );
                    }

                    const response = {
                        success: true,
                    };

                    return new Result<DeleteResponse, Error>(response, null);
                } else {
                    const response = {
                        success: false,
                    };

                    return new Result<DeleteResponse, Error>(response, null);
                }
            });
        } catch (err) {
            console.log(err);
            return new Result<DeleteResponse, Error>(null, err);
        }
    }
}
