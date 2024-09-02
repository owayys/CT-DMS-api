import { UploadedFile } from "express-fileupload";
import { DeleteResponse, UpdateResponse } from "../lib/validators/common";
import {
    DocumentContentResponse,
    DocumentResponse,
    GetDocument,
    SaveDocumentResponse,
    TagResponse,
} from "../lib/validators/documentSchemas";
import { IDocumentRepository } from "../repositories/IDocumentRepository";

export class DocumentService {
    constructor(private repository: IDocumentRepository) {}

    async get(userId: string, documentId: string): Promise<any> {
        const response = await this.repository.findById(userId, documentId);
        const { data, success, error } = GetDocument.safeParse(response);

        return success ? data : error;
    }

    async getAll(
        userId: string,
        pageNumber: number,
        pageSize: number,
        tag: string | null
    ): Promise<any> {
        const response = await this.repository.all(
            userId,
            pageNumber,
            pageSize,
            tag
        );
        const { data, success, error } = DocumentResponse.safeParse(response);

        return success ? data : error;
    }

    async getContent(userId: string, documentId: string): Promise<any> {
        const response = await this.repository.getContentById(
            userId,
            documentId
        );

        const { data, success, error } =
            DocumentContentResponse.safeParse(response);

        return success ? data : error;
    }

    async save(
        userId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<any> {
        const response = await this.repository.save(
            userId,
            fileName,
            fileExtension,
            contentType,
            tags,
            content
        );

        const { data, success, error } =
            SaveDocumentResponse.safeParse(response);

        return success ? data : error;
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
        const response = await this.repository.update(
            userId,
            documentId,
            fileName,
            fileExtension,
            contentType,
            tags,
            content
        );

        const { data, success, error } = UpdateResponse.safeParse(response);

        return success ? data : error;
    }

    async addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<any> {
        try {
            console.log(tag);
            let response = await this.repository.addTag(documentId, tag);

            const { data, success, error } = TagResponse.safeParse(response);

            return success ? data : error;
        } catch (err) {
            console.error(`Error Adding Tag`, err.message);
            console.log(err);

            return err;
        }
    }

    async removeTag(documentId: string, tag: { key: string; name: string }) {
        try {
            let response = await this.repository.removeTag(documentId, tag);

            const { data, success, error } = DeleteResponse.safeParse(response);

            return success ? data : error;
        } catch (err) {
            return {
                success: false,
            };
        }
    }

    async download(link: string): Promise<any> {
        return await this.repository.download(link);
    }

    async upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[]
    ): Promise<any> {
        const document = await this.repository.upload(
            userId,
            file,
            fileName,
            fileExtension,
            contentType,
            tags
        );

        return document;
    }

    async remove(
        user: {
            Id: string;
            userName: string;
            userRole: string;
        },
        documentId: string
    ): Promise<any> {
        const response = await this.repository.remove(user, documentId);

        const { data, success, error } = DeleteResponse.safeParse(response);

        return success ? data : error;
    }
}
