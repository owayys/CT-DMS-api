import { and, eq, ne } from "drizzle-orm";
import { DocumentEntity } from "../../domain/entities/document/document.entity";
import { DocumentResponseDto } from "../../application/dtos/document/document.response.dto";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { DATABASE, DOCUMENT_MAPPER, TAG_MAPPER } from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { DocumentModel } from "../mappers/document.mapper";
import { IDrizzleConnection } from "../database/types";
import { DocumentTable, TagTable } from "../database/schema";
import { TagEntity } from "../../domain/entities/document/tag.entity";
import { TagResponseDto } from "../../application/dtos/document/tag.response.dto";
import { TagModel } from "../mappers/tag.mapper";
import { UserDefinedMetadata } from "../../domain/types/document.types";
import {
    AlreadyExistsError,
    NotFoundError,
    RepositoryResult,
    Paginated,
    PaginationOptions,
    AppError,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";
import { IDocumentRepository } from "../../domain/repositories/document.repository.port";
import { filterByCriteria } from "../../lib/util/filter-by.util";
import { paginate } from "../../lib/util/paginate.util";

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
    async insert(
        entity: DocumentEntity
    ): Promise<RepositoryResult<DocumentEntity, AlreadyExistsError>> {
        try {
            return await this._db.transaction(async (tx) => {
                const [document] = await tx
                    .insert(DocumentTable)
                    .values({
                        Id: entity.id,
                        userId: entity.ownerId,
                        fileName: entity.fileName,
                        fileExtension: entity.fileExtension,
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

                return Result.Ok(this.documentMapper.toDomain(response));
            });
        } catch (err) {
            return Result.Err(err);
        }
    }
    async findOneById(id: string): Promise<RepositoryResult<DocumentEntity>> {
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
                return Result.Ok(this.documentMapper.toDomain(response));
            } else {
                return Result.Err(AppError.NotFound("Document not found"));
            }
        } catch (err) {
            return Result.Err(err);
        }
    }
    async findAll(): Promise<RepositoryResult<DocumentEntity[]>> {
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
                return Result.Ok(response.map(this.documentMapper.toDomain));
            } else {
                return Result.Err(AppError.NotFound("Document not found"));
            }
        } catch (err) {
            return Result.Err(err);
        }
    }
    async findAllPaginated(
        params: PaginationOptions,
        filterBy?: any
    ): Promise<RepositoryResult<Paginated<DocumentEntity>>> {
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

            if (filterBy !== undefined) {
                documents = filterByCriteria(documents, filterBy);
            }

            let documentsMapped = documents
                .map((item) => {
                    return {
                        ...item,
                        meta: (item.meta as UserDefinedMetadata) ?? null,
                    };
                })
                .map(this.documentMapper.toDomain);

            const response: Paginated<DocumentEntity> = paginate(
                documentsMapped,
                params
            );

            return Result.Ok(response);
        } catch (err) {
            console.log(err);
            return Result.Err(err);
        }
    }

    async findByOwner(
        owner: string
    ): Promise<RepositoryResult<DocumentEntity[]>> {
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
                return Result.Ok(response.map(this.documentMapper.toDomain));
            } else {
                return Result.Err(AppError.NotFound("Document not found"));
            }
        } catch (err) {
            return Result.Err(err);
        }
    }

    async update(
        entity: DocumentEntity
    ): Promise<RepositoryResult<DocumentEntity, NotFoundError>> {
        try {
            return await this._db.transaction(async (tx) => {
                const documentId = entity.id!.toString();
                const [document] = await tx
                    .select()
                    .from(DocumentTable)
                    .where(eq(DocumentTable.Id, documentId));

                if (!document) {
                    return Result.Err(AppError.NotFound("Document not found"));
                }

                await tx
                    .update(DocumentTable)
                    .set({
                        fileName: entity.fileName,
                        fileExtension: entity.fileExtension,
                        contentType: entity.contentType,
                        content: entity.content,
                        meta: entity.meta ?? null,
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
                    .delete(TagTable)
                    .where(eq(TagTable.documentId, documentId));

                await tx
                    .insert(TagTable)
                    .values(docTags)
                    .onConflictDoNothing({
                        target: [TagTable.documentId, TagTable.key],
                    });

                const updatedDocument = await tx.query.DocumentTable.findFirst({
                    where: eq(DocumentTable.Id, documentId),
                    with: { tags: true },
                });

                if (updatedDocument) {
                    return Result.Ok(
                        this.documentMapper.toDomain({
                            ...updatedDocument,
                            meta: updatedDocument.meta as UserDefinedMetadata,
                        })
                    );
                } else {
                    return Result.Err(AppError.NotFound("Document not found"));
                }
            });
        } catch (err) {
            return Result.Err(err);
        }
    }

    async delete(entity: DocumentEntity): Promise<RepositoryResult<boolean>> {
        try {
            return await this._db.transaction(async (tx) => {
                let doc = await tx.query.DocumentTable.findFirst({
                    where: eq(DocumentTable.Id, entity.id!.toString()),
                });

                if (!doc) {
                    return Result.Ok(false);
                }

                await tx
                    .delete(TagTable)
                    .where(eq(TagTable.documentId, entity.id!.toString()));
                await tx
                    .delete(DocumentTable)
                    .where(eq(DocumentTable.Id, entity.id!.toString()));

                return Result.Ok(true);
            });
        } catch (err) {
            return Result.Err(err);
        }
    }
}
