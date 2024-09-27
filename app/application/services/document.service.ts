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
} from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { parseResponse } from "../../lib/util/parse-response.util";
import { z } from "zod";
import { ILogger } from "../../lib/logging/ILogger";
import {
    AuthorizeDocumentAccessCommand,
    UserDefinedMetadata,
} from "../../domain/types/document.types";
import { DocumentEntity } from "../../domain/entities/document/document.entity";
import { TagEntity } from "../../domain/entities/document/tag.entity";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { DocumentModel } from "../../infrastructure/mappers/document.mapper";
import { DocumentResponseDto } from "../dtos/document/document.response.dto";
import { IDomainService } from "../../lib/ddd/domain-service.interface";
import { IFileHandler } from "../../domain/ports/file-handler.port";
import { signUrl } from "../../lib/util/sign-url.util";
import { UploadedFile } from "express-fileupload";
import { verifyUrl } from "../../lib/util/verify-url.util";
import { AppError, AppResult, PaginationOptions } from "@carbonteq/hexapp";

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
        >
    ) {}

    async get(
        userId: string,
        documentId: string
    ): Promise<AppResult<GetDocumentResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
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
        filterBy?: any
    ): Promise<AppResult<any>> {
        const params = PaginationOptions.create({
            pageNum: pageNumber,
            pageSize,
        });

        if (params.isErr()) {
            return AppResult.Err(params.unwrapErr());
        }

        const result = await this.repository.findAllPaginated(
            params.unwrap(),
            filterBy
        );

        if (result.isOk()) {
            const response = result.unwrap();
            let mappedResponse = {
                ...response,
                data: response.data.map(this.documentMapper.toResponse),
            };
            return parseResponse(DocumentResponse, mappedResponse);
        } else {
            return AppResult.Err(result.unwrapErr());
        }
    }

    async getContent(
        userId: string,
        documentId: string
    ): Promise<AppResult<DocumentContentResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
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
            const signedUrlResponse = signUrl(file, {
                fileName: document.fileName,
                fileExtension: document.fileExtension,
            });

            if (signedUrlResponse.isErr()) {
                return AppResult.Err(AppError.InvalidData("Error signing url"));
            }

            const signedUrl = signedUrlResponse.unwrap();

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
            userId,
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
            return AppResult.Err(result.unwrapErr());
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
            return AppResult.Err(documentResponse.unwrapErr());
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
            return parseResponse(UpdateResponse, { success: true });
        } else {
            return AppResult.Err(result.unwrapErr());
        }
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<AppResult<UpdateResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
        }

        const document = documentResponse.unwrap();

        document.addTag(tag);

        const result = await this.repository.update(document);

        if (result.isOk()) {
            return parseResponse(UpdateResponse, { success: true });
        } else {
            return AppResult.Err(result.unwrapErr());
        }
    }

    async updateTag(
        documentId: string,
        tag: {
            key: string;
            name: string;
        }
    ): Promise<AppResult<GetDocumentResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
        }

        const document = documentResponse.unwrap();

        document.updateTag(tag);

        const result = await this.repository.update(document);

        if (result.isOk()) {
            return parseResponse(
                GetDocumentResponse,
                this.documentMapper.toResponse(document)
            );
        } else {
            return AppResult.Err(result.unwrapErr());
        }
    }

    async removeTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<AppResult<GetDocumentResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
        }

        const document = documentResponse.unwrap();
        document.deleteTag(tag.key);

        const result = await this.repository.update(document);

        if (result.isOk()) {
            return parseResponse(
                GetDocumentResponse,
                this.documentMapper.toResponse(document)
            );
        } else {
            return AppResult.Err(result.unwrapErr());
        }
    }

    async updateMeta(
        documentId: string,
        meta: UserDefinedMetadata
    ): Promise<AppResult<GetDocumentResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
        }

        const document = documentResponse.unwrap();
        document.updateMeta(meta);

        const result = await this.repository.update(document);

        if (result.isOk()) {
            return parseResponse(
                GetDocumentResponse,
                this.documentMapper.toResponse(result.unwrap())
            );
        } else {
            return AppResult.Err(result.unwrapErr());
        }
    }

    async deleteMeta(
        documentId: string
    ): Promise<AppResult<GetDocumentResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
        }

        const document = documentResponse.unwrap();
        document.deleteMeta();

        const result = await this.repository.update(document);

        if (result.isOk()) {
            return parseResponse(
                GetDocumentResponse,
                this.documentMapper.toResponse(result.unwrap())
            );
        } else {
            return AppResult.Err(result.unwrapErr());
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
            userId,
            fileName,
            fileExtension,
            contentType,
            tags,
            content: `[FILE_UPLOADED]`,
            meta,
        });
        const insertDocumentResponse = await this.repository.insert(document);

        if (insertDocumentResponse.isErr()) {
            return AppResult.Err(insertDocumentResponse.unwrapErr());
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

    async remove(documentId: string): Promise<AppResult<UpdateResponse>> {
        const documentResponse = await this.repository.findOneById(documentId);
        console.log(documentResponse);

        if (documentResponse.isErr()) {
            return AppResult.Err(documentResponse.unwrapErr());
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
            return AppResult.Err(result.unwrapErr());
        }
    }
}
