import { and, eq } from "drizzle-orm";
import { DocumentEntity } from "../../domain/entities/document.entity";
import { IDocumentRepository } from "../../domain/repositories/document.repository.port";
import { DocumentResponseDto } from "../../application/dtos/document.response.dto";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { Paginated, PaginatedQueryParams } from "../../lib/ddd/repository.port";
import { DATABASE, DOCUMENT_MAPPER, TAG_MAPPER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { DocumentModel } from "../mappers/document.mapper";
import { IDrizzleConnection } from "../database/types";
import { DocumentTable, TagTable } from "../database/schema";
import { TagEntity } from "../../domain/entities/tag.entity";
import { TagResponseDto } from "../../application/dtos/tag.response.dto";
import { TagModel } from "../mappers/tag.mapper";
import { UserDefinedMetadata } from "../../domain/types/document.types";
import { NotFoundException } from "../../lib/exceptions/exceptions";
import { AppResult } from "@carbonteq/hexapp";

@InjectionTarget()
export class DocumentRepository implements IDocumentRepository {
    constructor(
        @Inject(DATABASE) private _db: IDrizzleConnection,
        @Inject(DOCUMENT_MAPPER)
        private documentMapper: Mapper<
            DocumentEntity,
            DocumentModel,
            DocumentResponseDto
        >,
        @Inject(TAG_MAPPER)
        private tagMapper: Mapper<TagEntity, TagModel, TagResponseDto>
    ) {}
    async insert(entity: DocumentEntity): Promise<AppResult<DocumentEntity>> {
        try {
            return await this._db.transaction(async (tx) => {
                const [document] = await tx
                    .insert(DocumentTable)
                    .values({
                        Id: entity.id!.toString(),
                        userId: entity.owner.toString(),
                        fileName: entity.name,
                        fileExtension: entity.extension,
                        contentType: entity.contentType,
                        content: entity.content,
                        meta: entity.meta,
                    })
                    .returning();
                let docTags = entity.tags.map(
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
                    ...document,
                    tags: insertedTags,
                    meta: (document.meta as UserDefinedMetadata) ?? null,
                };

                return AppResult.Ok(this.documentMapper.toDomain(response));
            });
        } catch (err) {
            return AppResult.Err(err);
        }
    }
    async findOneById(id: string): Promise<AppResult<DocumentEntity>> {
        try {
            const document = await this._db.query.DocumentTable.findFirst({
                where: eq(DocumentTable.Id, id),
                with: {
                    tags: {
                        columns: {
                            documentId: false,
                        },
                    },
                },
            });

            if (document) {
                const response = {
                    ...document,
                    meta: (document.meta as UserDefinedMetadata) ?? null,
                };
                return AppResult.Ok(this.documentMapper.toDomain(response));
            } else {
                return AppResult.Err(
                    new NotFoundException("Document not found")
                );
            }
        } catch (err) {
            return AppResult.Err(err);
        }
    }
    async findAll(): Promise<AppResult<DocumentEntity[]>> {
        try {
            const documents = await this._db.query.DocumentTable.findMany({
                with: {
                    tags: {
                        columns: {
                            documentId: false,
                        },
                    },
                },
            });

            if (documents) {
                const response = documents.map((doc) => {
                    return {
                        ...doc,
                        meta: (doc.meta as UserDefinedMetadata) ?? null,
                    };
                });
                return AppResult.Ok(response.map(this.documentMapper.toDomain));
            } else {
                return AppResult.Err(
                    new NotFoundException("Document not found")
                );
            }
        } catch (err) {
            return AppResult.Err(err);
        }
    }
    async findAllPaginated(
        params: PaginatedQueryParams
    ): Promise<AppResult<Paginated<DocumentEntity>>> {
        try {
            let documents = await this._db.query.DocumentTable.findMany({
                with: {
                    tags: {
                        columns: {
                            documentId: false,
                        },
                    },
                },
            });

            let totalItems = documents.length;
            let totalPages = Math.ceil(documents.length / params.pageSize);
            let page = Math.min(totalPages, params.pageNumber);
            let items = documents
                .slice(
                    (page - 1) * params.pageSize,
                    (page - 1) * params.pageSize + params.pageSize
                )
                .map((item) => {
                    return {
                        ...item,
                        meta: (item.meta as UserDefinedMetadata) ?? null,
                    };
                });
            let size = Math.min(items.length, params.pageSize);

            const response: Paginated<DocumentEntity> = {
                page: page,
                size: size,
                totalPages: totalPages,
                totalItems: totalItems,
                items: items.map(this.documentMapper.toDomain),
            };

            return AppResult.Ok(response);
        } catch (err) {
            console.log(err);
            return AppResult.Err(err);
        }
    }

    async findByOwner(owner: string): Promise<AppResult<DocumentEntity[]>> {
        try {
            const documents = await this._db.query.DocumentTable.findMany({
                where: eq(DocumentTable.userId, owner),
                with: {
                    tags: {
                        columns: {
                            documentId: false,
                        },
                    },
                },
            });

            if (documents) {
                const response = documents.map((doc) => {
                    return {
                        ...doc,
                        meta: (doc.meta as UserDefinedMetadata) ?? null,
                    };
                });
                return AppResult.Ok(response.map(this.documentMapper.toDomain));
            } else {
                return AppResult.Err(
                    new NotFoundException("Document not found")
                );
            }
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async update(entity: DocumentEntity): Promise<AppResult<boolean>> {
        try {
            return await this._db.transaction(async (tx) => {
                const documentId = entity.id!.toString();
                const [document] = await tx
                    .select()
                    .from(DocumentTable)
                    .where(eq(DocumentTable.Id, documentId));

                if (!document) {
                    return AppResult.Ok(false);
                }

                await tx
                    .update(DocumentTable)
                    .set({
                        fileName: entity.name,
                        fileExtension: entity.extension,
                        contentType: entity.contentType,
                        content: entity.content,
                    })
                    .where(eq(DocumentTable.Id, documentId));

                const tags = entity.tags.map(this.tagMapper.toPersistence);

                let docTags = tags.map(
                    (tag: { key: string; name: string }) => ({
                        documentId: documentId,
                        key: tag.key,
                        name: tag.name,
                    })
                );

                await tx
                    .insert(TagTable)
                    .values(docTags)
                    .onConflictDoNothing({
                        target: [TagTable.documentId, TagTable.key],
                    });

                return AppResult.Ok(true);
            });
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async delete(entity: DocumentEntity): Promise<AppResult<boolean>> {
        try {
            return await this._db.transaction(async (tx) => {
                let doc = await tx.query.DocumentTable.findFirst({
                    where: eq(DocumentTable.Id, entity.id!.toString()),
                });

                if (!doc) {
                    return AppResult.Ok(false);
                }

                await tx
                    .delete(TagTable)
                    .where(eq(TagTable.documentId, entity.id!.toString()));
                await tx
                    .delete(DocumentTable)
                    .where(eq(DocumentTable.Id, entity.id!.toString()));

                return AppResult.Ok(true);
            });
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async addTag(id: string, entity: TagEntity): Promise<AppResult<boolean>> {
        try {
            return await this._db.transaction(async (tx) => {
                await tx
                    .insert(TagTable)
                    .values({
                        documentId: id,
                        key: entity.key,
                        name: entity.name,
                    })
                    .returning()
                    .onConflictDoNothing({
                        target: [TagTable.documentId, TagTable.key],
                    });

                return AppResult.Ok(true);
            });
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async updateTag(
        id: string,
        entity: TagEntity
    ): Promise<AppResult<boolean>> {
        try {
            const [tag] = await this._db
                .update(TagTable)
                .set({
                    name: entity.name,
                })
                .where(
                    and(
                        eq(TagTable.key, entity.key),
                        eq(TagTable.documentId, id)
                    )
                )
                .returning();

            return AppResult.Ok(true);
        } catch (err) {
            return AppResult.Err(err);
        }
    }

    async removeTag(
        id: string,
        entity: TagEntity
    ): Promise<AppResult<boolean>> {
        try {
            const [tag] = await this._db
                .delete(TagTable)
                .where(
                    and(
                        eq(TagTable.key, entity.key),
                        eq(TagTable.documentId, id)
                    )
                )
                .returning();

            return tag ? AppResult.Ok(true) : AppResult.Ok(false);
        } catch (err) {
            return AppResult.Err(err);
        }
    }
}
