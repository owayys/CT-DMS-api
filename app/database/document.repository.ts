import { and, eq } from "drizzle-orm";
import { DocumentEntity } from "../domain/entities/document.entity";
import { IDocumentRepository } from "../domain/repositories/document.repository";
import { DocumentResponseDto } from "../dtos/document.response.dto";
import { Mapper } from "../lib/ddd/mapper.interface";
import { Paginated, PaginatedQueryParams } from "../lib/ddd/repository.port";
import { DATABASE, DOCUMENT_MAPPER, TAG_MAPPER } from "../lib/di/di.tokens";
import { Inject } from "../lib/di/Inject";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { Result } from "../lib/util/result";
import { DocumentModel } from "../mappers/document.mapper";
import { IDrizzleConnection } from "./types";
import { DocumentTable, TagTable } from "./schema";
import { TagEntity } from "../domain/entities/tag.entity";
import { TagResponseDto } from "../dtos/tag.response.dto";
import { TagModel } from "../mappers/tag.mapper";

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
    ): Promise<Result<DocumentEntity, Error>> {
        try {
            return await this._db.transaction(async (tx) => {
                console.log(entity.id!.toString());
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
                };

                console.log(response);

                return new Result<DocumentEntity, Error>(
                    this.documentMapper.toDomain(response),
                    null
                );
            });
        } catch (err) {
            return new Result<DocumentEntity, Error>(null, err);
        }
    }
    async findOneById(id: string): Promise<Result<DocumentEntity, Error>> {
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
                return new Result<DocumentEntity, Error>(
                    this.documentMapper.toDomain(document),
                    null
                );
            } else {
                return new Result<DocumentEntity, Error>(
                    null,
                    new Error("Document not found")
                );
            }
        } catch (err) {
            return new Result<DocumentEntity, Error>(null, err);
        }
    }
    async findAll(): Promise<Result<DocumentEntity[], Error>> {
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

            if (document) {
                return new Result<DocumentEntity[], Error>(
                    documents.map(this.documentMapper.toDomain),
                    null
                );
            } else {
                return new Result<DocumentEntity[], Error>(
                    null,
                    new Error("Document not found")
                );
            }
        } catch (err) {
            return new Result<DocumentEntity[], Error>(null, err);
        }
    }
    async findAllPaginated(
        params: PaginatedQueryParams
    ): Promise<Result<Paginated<DocumentEntity>, Error>> {
        try {
            let users = await this._db.query.DocumentTable.findMany();

            let totalItems = users.length;
            let totalPages = Math.ceil(users.length / params.pageSize);
            let page = Math.min(totalPages, params.pageNumber);
            let items = users.slice(
                params.pageNumber * params.pageSize,
                params.pageNumber * params.pageSize + params.pageSize
            );
            let size = Math.min(items.length, params.pageSize);

            const response: Paginated<DocumentEntity> = {
                page: page + 1,
                size: size,
                totalPages: totalPages,
                totalItems: totalItems,
                items: items.map(this.documentMapper.toDomain),
            };

            return new Result<Paginated<DocumentEntity>, Error>(response, null);
        } catch (err) {
            return new Result<Paginated<DocumentEntity>, Error>(null, err);
        }
    }

    async update(entity: DocumentEntity): Promise<Result<boolean, Error>> {
        try {
            return await this._db.transaction(async (tx) => {
                const documentId = entity.id!.toString();
                const [document] = await tx
                    .select()
                    .from(DocumentTable)
                    .where(eq(DocumentTable.Id, documentId));

                if (!document) {
                    return new Result<boolean, Error>(false, null);
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

                await tx.insert(TagTable).values(docTags).onConflictDoNothing({
                    target: TagTable.key,
                });

                return new Result<boolean, Error>(true, null);
            });
        } catch (err) {
            console.log(err);
            return new Result<boolean, Error>(null, err);
        }
    }

    async delete(entity: DocumentEntity): Promise<Result<boolean, Error>> {
        try {
            return await this._db.transaction(async (tx) => {
                let doc = await tx.query.DocumentTable.findFirst({
                    where: eq(DocumentTable.Id, entity.id!.toString()),
                });

                if (!doc) {
                    return new Result<boolean, Error>(false, null);
                }

                await tx
                    .delete(TagTable)
                    .where(eq(TagTable.documentId, entity.id!.toString()));
                await tx
                    .delete(DocumentTable)
                    .where(eq(DocumentTable.Id, entity.id!.toString()));

                return new Result<boolean, Error>(true, null);
            });
        } catch (err) {
            return new Result<boolean, Error>(null, err);
        }
    }

    async addTag(
        id: string,
        entity: TagEntity
    ): Promise<Result<TagEntity, Error>> {
        try {
            return await this._db.transaction(async (tx) => {
                const [tagResult] = await tx
                    .insert(TagTable)
                    .values({
                        documentId: id,
                        key: entity.key,
                        name: entity.name,
                    })
                    .returning({
                        key: TagTable.key,
                        name: TagTable.name,
                    })
                    .onConflictDoNothing({
                        target: [TagTable.documentId, TagTable.key],
                    });

                return tagResult
                    ? new Result<TagEntity, Error>(
                          this.tagMapper.toDomain(tagResult),
                          null
                      )
                    : new Result<TagEntity, Error>(entity, null);
            });
        } catch (err) {
            return new Result<TagEntity, Error>(null, err);
        }
    }

    async updateTag(
        id: string,
        entity: TagEntity
    ): Promise<Result<TagEntity, Error>> {
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
                .returning({
                    key: TagTable.key,
                    name: TagTable.name,
                });

            return new Result<TagEntity, Error>(
                this.tagMapper.toDomain(tag),
                null
            );
        } catch (err) {
            return new Result<TagEntity, Error>(null, err);
        }
    }

    async removeTag(
        id: string,
        entity: TagEntity
    ): Promise<Result<TagEntity, Error>> {
        try {
            const [tag] = await this._db
                .delete(TagTable)
                .where(
                    and(
                        eq(TagTable.key, entity.key),
                        eq(TagTable.documentId, id)
                    )
                )
                .returning({
                    key: TagTable.key,
                    name: TagTable.name,
                });

            return new Result<TagEntity, Error>(
                this.tagMapper.toDomain(tag),
                null
            );
        } catch (err) {
            return new Result<TagEntity, Error>(null, err);
        }
    }
}
