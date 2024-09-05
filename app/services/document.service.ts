import { UploadedFile } from "express-fileupload";
import { DeleteResponse, UpdateResponse } from "../lib/validators/common";
import {
    DocumentContentResponse,
    DocumentResponse,
    GetDocumentResponse,
    SaveDocumentResponse,
    TagResponse,
} from "../lib/validators/documentSchemas";
import { IDocumentRepository } from "../repositories/IDocumentRepository";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { DOCUMENT_REPOSITORY, LOGGER } from "../lib/di/di.tokens";
import { Inject } from "../lib/di/Inject";
import { parseResponse } from "../lib/util/parseResponse";
import { Result } from "../lib/util/result";
import { z } from "zod";
import { ILogger } from "../lib/logging/ILogger";

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
        private logger: ILogger
    ) {}

    async get(
        userId: string,
        documentId: string
    ): Promise<Result<GetDocumentResponse, Error>> {
        return (await this.repository.findById(userId, documentId)).bind(
            (response) => parseResponse(GetDocumentResponse, response)
        );
    }

    async getAll(
        userId: string,
        pageNumber: number,
        pageSize: number,
        tag: string | null
    ): Promise<Result<DocumentResponse, Error>> {
        return (
            await this.repository.all(userId, pageNumber, pageSize, tag)
        ).bind((response) => parseResponse(DocumentResponse, response));
    }

    async getContent(
        userId: string,
        documentId: string
    ): Promise<Result<DocumentContentResponse, Error>> {
        return (await this.repository.getContentById(userId, documentId)).bind(
            (response) => parseResponse(DocumentContentResponse, response)
        );
    }

    async save(
        userId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<Result<SaveDocumentResponse, Error>> {
        return (
            await this.repository.save(
                userId,
                fileName,
                fileExtension,
                contentType,
                tags,
                content
            )
        ).bind((response) => parseResponse(SaveDocumentResponse, response));
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
        return (
            await this.repository.update(
                userId,
                documentId,
                fileName,
                fileExtension,
                contentType,
                tags,
                content
            )
        ).bind((response) => parseResponse(UpdateResponse, response));
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<TagResponse, Error>> {
        return (await this.repository.addTag(documentId, tag)).bind(
            (response) => parseResponse(TagResponse, response)
        );
    }

    async updateTag(
        documentId: string,
        tag: {
            key: string;
            name: string;
        }
    ): Promise<Result<UpdateResponse, Error>> {
        return (await this.repository.updateTag(documentId, tag)).bind(
            (response) => parseResponse(UpdateResponse, response)
        );
    }

    async removeTag(documentId: string, tag: { key: string; name: string }) {
        return (await this.repository.removeTag(documentId, tag)).bind(
            (response) => parseResponse(DeleteResponse, response)
        );
    }

    async download(link: string): Promise<Result<any, Error>> {
        return await this.repository.download(link);
    }

    async upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[]
    ): Promise<Result<GetDocumentResponse, Error>> {
        return (
            await this.repository.upload(
                userId,
                file,
                fileName,
                fileExtension,
                contentType,
                tags
            )
        ).bind((response) => parseResponse(GetDocumentResponse, response));
    }

    async remove(
        user: {
            Id: string;
            userName: string;
            userRole: string;
        },
        documentId: string
    ): Promise<Result<DeleteResponse, Error>> {
        return (await this.repository.remove(user, documentId)).bind(
            (response) => parseResponse(DeleteResponse, response)
        );
    }
}
