import { UploadedFile } from "express-fileupload";
import { DeleteResponse, UpdateResponse } from "../../lib/validators/common";
import {
    DocumentContentResponse,
    DocumentResponse,
    GetDocumentResponse,
    SaveDocumentResponse,
    TagResponse,
} from "../../lib/validators/document.validators";
// import { IDocumentRepository } from "../repositories/IDocumentRepository";
import { IDocumentRepository } from "../../domain/repositories/document.repository";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import {
    DOCUMENT_MAPPER,
    DOCUMENT_REPOSITORY,
    LOGGER,
    TAG_MAPPER,
} from "../../lib/di/di.tokens";
import { Inject } from "../../lib/di/Inject";
import { parseResponse } from "../../lib/util/parse-response.util";
import { Result } from "../../lib/util/result";
import { z } from "zod";
import { ILogger } from "../../lib/logging/ILogger";
import { UserDefinedMetadata } from "../../domain/types/document.types";
import { DocumentEntity } from "../../domain/entities/document.entity";
import { UUID } from "../../domain/value-objects/uuid.value-object";
import { TagEntity } from "../../domain/entities/tag.entity";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { DocumentModel } from "../../infrastructure/mappers/document.mapper";
import { DocumentResponseDto } from "../../infrastructure/dtos/document.response.dto";
import { PaginatedQueryParams } from "../../lib/ddd/repository.port";
import { TagModel } from "../../infrastructure/mappers/tag.mapper";
import { TagResponseDto } from "../../infrastructure/dtos/tag.response.dto";

type GetDocumentResponse = z.infer<typeof GetDocumentResponse>;
type DocumentResponse = z.infer<typeof DocumentResponse>;
type DocumentContentResponse = z.infer<typeof DocumentContentResponse>;
type SaveDocumentResponse = z.infer<typeof SaveDocumentResponse>;
type UpdateResponse = z.infer<typeof UpdateResponse>;
type TagResponse = z.infer<typeof TagResponse>;
type DeleteResponse = z.infer<typeof DeleteResponse>;

@InjectionTarget()
export class DocumentService {
    constructor(
        @Inject(DOCUMENT_REPOSITORY)
        private repository: IDocumentRepository,
        @Inject(LOGGER)
        private logger: ILogger,
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
        return (await this.repository.findOneById(documentId)).bind(
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

    // async getContent(
    //     userId: string,
    //     documentId: string
    // ): Promise<Result<DocumentContentResponse, Error>> {
    //     return (await this.repository.getContentById(userId, documentId)).bind(
    //         (response) => parseResponse(DocumentContentResponse, response)
    //     );
    // }

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
            tags: tags.map(TagEntity.create),
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
        const document = this.documentMapper.toDomain({
            userId,
            documentId: documentId,
            fileName,
            fileExtension,
            contentType,
            content,
            tags: tags.map(this.tagMapper.toDomain),
        });
        return (await this.repository.update(document)).bind((response) =>
            parseResponse(UpdateResponse, { success: response })
        );
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<TagResponse, Error>> {
        const entity = this.tagMapper.toDomain(tag);
        return (await this.repository.addTag(documentId, entity)).bind(
            (response) =>
                parseResponse(TagResponse, this.tagMapper.toResponse(response))
        );
    }

    async updateTag(
        documentId: string,
        tag: {
            key: string;
            name: string;
        }
    ): Promise<Result<UpdateResponse, Error>> {
        const entity = this.tagMapper.toDomain(tag);
        return (await this.repository.updateTag(documentId, entity)).bind(
            (response) =>
                parseResponse(
                    UpdateResponse,
                    this.tagMapper.toResponse(response)
                )
        );
    }

    async removeTag(documentId: string, tag: { key: string; name: string }) {
        const entity = this.tagMapper.toDomain(tag);
        return (await this.repository.removeTag(documentId, entity)).bind(
            (response) =>
                parseResponse(
                    DeleteResponse,
                    this.tagMapper.toResponse(response)
                )
        );
    }

    // async download(link: string): Promise<Result<any, Error>> {
    //     return await this.repository.download(link);
    // }

    // async upload(
    //     userId: string,
    //     file: UploadedFile,
    //     fileName: string,
    //     fileExtension: string,
    //     contentType: string,
    //     tags: { key: string; name: string }[]
    // ): Promise<Result<GetDocumentResponse, Error>> {
    //     return (
    //         await this.repository.upload(
    //             userId,
    //             file,
    //             fileName,
    //             fileExtension,
    //             contentType,
    //             tags
    //         )
    //     ).bind((response) => parseResponse(GetDocumentResponse, response));
    // }

    async remove(
        user: {
            Id: string;
            userName: string;
            userRole: string;
        },
        documentId: string
    ): Promise<Result<DocumentEntity, Error>> {
        const response = await this.repository.findOneById(documentId);

        if (response.isOk()) {
            const document = response.unwrap();
            return (await this.repository.delete(document)).bind((response) =>
                parseResponse(DeleteResponse, { success: response })
            );
        } else {
            return response;
        }
    }
}
