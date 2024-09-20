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
import { AppResult } from "@carbonteq/hexapp";

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
        > // @Inject(TAG_MAPPER) // private tagMapper: Mapper<TagEntity, TagModel, TagResponseDto>
    ) {}

    async get(
        userId: string,
        documentId: string
    ): Promise<AppResult<GetDocumentResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();

        const commandResponse = await this.authService.execute({
            userId,
            document,
        });

        if (commandResponse.isOk()) {
            return parseResponse(
                GetDocumentResponse,
                this.documentMapper.toResponse(commandResponse.unwrap())
            );
        } else {
            return commandResponse;
        }
    }

    async getAll(
        pageNumber: number,
        pageSize: number,
        tag: string | null
    ): Promise<AppResult<DocumentResponse>> {
        const params: PaginatedQueryParams = {
            pageSize,
            pageNumber,
            orderBy: {
                field: "id",
                param: "asc",
            },
        };

        const result = await this.repository.findAllPaginated(params);

        if (result.isOk()) {
            const response = result.unwrap();
            return parseResponse(DocumentResponse, {
                ...response,
                items: response.items.map(this.documentMapper.toResponse),
            });
        } else {
            return result;
        }
    }

    async getContent(
        userId: string,
        documentId: string
    ): Promise<AppResult<DocumentContentResponse>> {
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

            const commandResponse = await this.authService.execute({
                userId,
                document,
            });

            if (commandResponse.isOk()) {
                return parseResponse(DocumentContentResponse, {
                    downloadUrl: `/api/v1/document/download/${signedUrl}`,
                    isBase64: false,
                });
            } else {
                return commandResponse;
            }
        } else {
            const commandResponse = await this.authService.execute({
                userId,
                document,
            });

            if (commandResponse.isOk()) {
                return parseResponse(DocumentContentResponse, {
                    content: document.content,
                });
            } else {
                return commandResponse;
            }
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
    ): Promise<AppResult<SaveDocumentResponse>> {
        const document = DocumentEntity.create({
            userId: UUID.fromString(userId),
            fileName,
            fileExtension,
            contentType,
            tags,
            content,
            meta,
        });

        const result = await this.repository.insert(document);

        if (result.isOk()) {
            return parseResponse(
                SaveDocumentResponse,
                this.documentMapper.toResponse(result.unwrap())
            );
        } else {
            return result;
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
    ): Promise<AppResult<UpdateResponse>> {
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

        const result = await this.repository.update(document);

        if (result.isOk()) {
            return parseResponse(UpdateResponse, { success: result.unwrap() });
        } else {
            return result;
        }
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<AppResult<UpdateResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();

        document.addTag(tag);

        const result = await this.repository.update(document);

        if (result.isOk()) {
            return parseResponse(UpdateResponse, { success: result.unwrap() });
        } else {
            return result;
        }
    }

    async updateTag(
        documentId: string,
        tag: {
            key: string;
            name: string;
        }
    ): Promise<AppResult<UpdateResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();
        const tagToUpdate = TagEntity.create(tag);

        document.updateTag(tagToUpdate);

        const result = await this.repository.updateTag(
            document.id!.toString(),
            tagToUpdate
        );

        if (result.isOk()) {
            return parseResponse(UpdateResponse, { success: result.unwrap() });
        } else {
            return result;
        }
    }

    async removeTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<AppResult<UpdateResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return documentResponse;
        }

        const document = documentResponse.unwrap();
        const tagToDelete = TagEntity.create(tag);
        document.updateTag(tagToDelete);

        const result = await this.repository.removeTag(
            document.id!.toString(),
            tagToDelete
        );

        if (result.isOk()) {
            return parseResponse(UpdateResponse, { success: result.unwrap() });
        } else {
            return result;
        }
    }

    async download(link: string): Promise<AppResult<any>> {
        const decodedResponse = verifyUrl(link);

        if (decodedResponse.isErr()) {
            return decodedResponse;
        }

        const { path, params } = decodedResponse.unwrap();

        return AppResult.Ok({
            filePath: path,
            fileName: `${params.fileName}${params.fileExtension}`,
        });
    }

    async upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        meta?: UserDefinedMetadata
    ): Promise<AppResult<GetDocumentResponse>> {
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

        return parseResponse(
            GetDocumentResponse,
            this.documentMapper.toResponse(insertedDocument)
        );
    }

    async remove(
        userId: string,
        documentId: string
    ): Promise<AppResult<UpdateResponse>> {
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

        const result = await this.repository.delete(document);

        if (result.isOk()) {
            return parseResponse(DeleteResponse, { success: result.unwrap() });
        } else {
            return result;
        }
    }
}
