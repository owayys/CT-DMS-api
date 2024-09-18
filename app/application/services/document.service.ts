import { DeleteResponse, UpdateResponse } from "../../lib/validators/common";
import {
    DocumentContentResponse,
    DocumentResponse,
    GetDocumentResponse,
    SaveDocumentResponse,
} from "../../lib/validators/document.validators";
import { IDocumentRepository } from "../../domain/repositories/document.repository.port";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import {
    AUTHORIZE_DOCUMENT_ACCESS_SERVICE,
    DOCUMENT_MAPPER,
    DOCUMENT_REPOSITORY,
    FILE_HANDLER,
    LOGGER,
    TAG_MAPPER,
} from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { parseResponse } from "../../lib/util/parse-response.util";
import { Result } from "../../lib/util/result";
import { z } from "zod";
import { ILogger } from "../../lib/logging/ILogger";
import {
    AuthorizeDocumentAccessCommand,
    UserDefinedMetadata,
} from "../../domain/types/document.types";
import { DocumentEntity } from "../../domain/entities/document.entity";
import { UUID } from "../../domain/value-objects/uuid.value-object";
import { TagEntity } from "../../domain/entities/tag.entity";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { DocumentModel } from "../../infrastructure/mappers/document.mapper";
import { DocumentResponseDto } from "../dtos/document.response.dto";
import { PaginatedQueryParams } from "../../lib/ddd/repository.port";
import { TagModel } from "../../infrastructure/mappers/tag.mapper";
import { TagResponseDto } from "../dtos/tag.response.dto";
import { IDomainService } from "../../lib/ddd/domain-service.interface";
import { IFileHandler } from "../../domain/ports/file-handler.port";
import { signUrl } from "../../lib/util/sign-url.util";
import { UploadedFile } from "express-fileupload";
import { verifyUrl } from "../../lib/util/verify-url.util";

type GetDocumentResponse = z.infer<typeof GetDocumentResponse>;
type DocumentResponse = z.infer<typeof DocumentResponse>;
type DocumentContentResponse = z.infer<typeof DocumentContentResponse>;
type SaveDocumentResponse = z.infer<typeof SaveDocumentResponse>;
type UpdateResponse = z.infer<typeof UpdateResponse>;
type DeleteResponse = z.infer<typeof DeleteResponse>;

@InjectionTarget()
export class DocumentService {
    constructor(
        @Inject(DOCUMENT_REPOSITORY)
        private repository: IDocumentRepository,
        @Inject(LOGGER)
        private logger: ILogger,
        @Inject(AUTHORIZE_DOCUMENT_ACCESS_SERVICE)
        private authService: IDomainService<
            AuthorizeDocumentAccessCommand,
            DocumentEntity
        >,
        @Inject(FILE_HANDLER)
        private fileHandler: IFileHandler,
        @Inject(DOCUMENT_MAPPER)
        private documentMapper: Mapper<
            DocumentEntity,
            DocumentModel,
            DocumentResponseDto
        >,
        @Inject(TAG_MAPPER)
        private tagMapper: Mapper<TagEntity, TagModel, TagResponseDto>
    ) {}

    async get(
        userId: string,
        documentId: string
    ): Promise<Result<GetDocumentResponse, Error>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();

        return (await this.authService.execute({ userId, document })).bind(
            (response) =>
                parseResponse(
                    GetDocumentResponse,
                    this.documentMapper.toResponse(response)
                )
        );
    }

    async getAll(
        pageNumber: number,
        pageSize: number,
        tag: string | null
    ): Promise<Result<DocumentResponse, Error>> {
        const params: PaginatedQueryParams = {
            pageSize,
            pageNumber,
            orderBy: {
                field: "id",
                param: "asc",
            },
        };
        return (await this.repository.findAllPaginated(params)).bind(
            (response) =>
                parseResponse(DocumentResponse, {
                    ...response,
                    items: response.items.map(this.documentMapper.toResponse),
                })
        );
    }

    async getContent(
        userId: string,
        documentId: string
    ): Promise<Result<DocumentContentResponse, Error>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();
        const documentContent = document.content;

        if (documentContent === `[FILE_UPLOADED]`) {
            const fileResponse = await this.fileHandler.getFile(
                document.id!.toString()
            );

            if (fileResponse.isErr()) {
                return fileResponse;
            }

            const file = fileResponse.unwrap();
            const signedUrl = signUrl(file, {
                fileName: document.name,
                fileExtension: document.extension,
            });

            return (await this.authService.execute({ userId, document }))
                .bind(() => signedUrl)
                .bind((url) =>
                    parseResponse(DocumentContentResponse, {
                        downloadUrl: `/api/v1/document/download/${url}`,
                        isBase64: false,
                    })
                );
        } else {
            return (await this.authService.execute({ userId, document })).bind(
                (document) =>
                    parseResponse(DocumentContentResponse, {
                        content: document.content,
                    })
            );
        }
    }

    async save(
        userId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string,
        meta: UserDefinedMetadata
    ): Promise<Result<SaveDocumentResponse, Error>> {
        const document = DocumentEntity.create({
            userId: UUID.fromString(userId),
            fileName,
            fileExtension,
            contentType,
            tags,
            content,
            meta,
        });
        return (await this.repository.insert(document)).bind((response) =>
            parseResponse(
                SaveDocumentResponse,
                this.documentMapper.toResponse(response)
            )
        );
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
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();

        const authResponse = await this.authService.execute({
            userId,
            document,
        });

        if (authResponse.isErr()) {
            return authResponse;
        }

        document.update({
            fileName,
            fileExtension,
            content,
            contentType,
            tags,
        });

        return (await this.repository.update(document)).bind((response) =>
            parseResponse(UpdateResponse, { success: response })
        );
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<UpdateResponse, Error>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();

        document.addTag(tag);

        return (await this.repository.update(document)).bind((response) =>
            parseResponse(UpdateResponse, { success: response })
        );
    }

    async updateTag(
        documentId: string,
        tag: {
            key: string;
            name: string;
        }
    ): Promise<Result<UpdateResponse, Error>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();
        const tagToUpdate = TagEntity.create(tag);
        document.updateTag(tagToUpdate);
        return (
            await this.repository.updateTag(
                document.id!.toString(),
                tagToUpdate
            )
        ).bind((response) =>
            parseResponse(UpdateResponse, { success: response })
        );
    }

    async removeTag(documentId: string, tag: { key: string; name: string }) {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();
        const tagToDelete = TagEntity.create(tag);
        document.updateTag(tagToDelete);
        return (
            await this.repository.removeTag(
                document.id!.toString(),
                tagToDelete
            )
        ).bind((response) =>
            parseResponse(UpdateResponse, { success: response })
        );
    }

    async download(link: string): Promise<Result<any, Error>> {
        const decodedResponse = verifyUrl(link);

        if (decodedResponse.isErr()) {
            return decodedResponse;
        }

        const { path, params } = decodedResponse.unwrap();

        return new Result<any, Error>(
            {
                filePath: path,
                fileName: `${params.fileName}${params.fileExtension}`,
            },
            null
        );
    }

    async upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        meta: UserDefinedMetadata
    ): Promise<Result<GetDocumentResponse, Error>> {
        const document = DocumentEntity.create({
            userId: UUID.fromString(userId),
            fileName,
            fileExtension,
            contentType,
            tags,
            content: `[FILE_UPLOADED]`,
            meta,
        });
        const insertDocumentResponse = await this.repository.insert(document);

        if (insertDocumentResponse.isErr()) {
            return insertDocumentResponse;
        }

        const insertedDocument = insertDocumentResponse.unwrap();

        const uploadFileResult = await this.fileHandler.uploadFile({
            id: insertedDocument.id!.toString(),
            file,
        });

        if (uploadFileResult.isErr()) {
            return uploadFileResult;
        }

        return insertDocumentResponse.bind((response) =>
            parseResponse(
                GetDocumentResponse,
                this.documentMapper.toResponse(response)
            )
        );
    }

    async remove(
        userId: string,
        documentId: string
    ): Promise<Result<DocumentEntity, Error>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();

        if (document.content === "[FILE_UPLOADED]") {
            const deleteResponse = await this.fileHandler.deleteFile(
                document.id!.toString()
            );

            if (deleteResponse.isErr()) {
                return deleteResponse;
            }
        }

        return (await this.repository.delete(document)).bind((response) =>
            parseResponse(DeleteResponse, { success: response })
        );
    }
}
