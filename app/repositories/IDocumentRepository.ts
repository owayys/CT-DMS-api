import { UploadedFile } from "express-fileupload";
import { Result } from "../lib/util/result";

export interface IDocumentRepository {
    findById(userId: string, documentId: string): Promise<Result<any, Error>>;

    all(
        userId: string,
        pageNumber: number,
        pageSize: number,
        tag: string | null
    ): Promise<Result<any, Error>>;

    getContentById(
        userId: string,
        documentId: string
    ): Promise<Result<any, Error>>;

    save(
        userId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<Result<any, Error>>;

    update(
        userId: string,
        documentId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<Result<any, Error>>;

    addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<any, Error>>;

    updateTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<any, Error>>;

    removeTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<Result<any, Error>>;

    download(link: string): Promise<Result<any, Error>>;

    upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[]
    ): Promise<Result<any, Error>>;

    remove(
        user: {
            Id: string;
            userName: string;
            userRole: string;
        },
        documentId: string
    ): Promise<Result<any, Error>>;
}
