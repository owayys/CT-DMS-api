import { UploadedFile } from "express-fileupload";

export interface IDocumentRepository {
    findById(userId: string, documentId: string): Promise<any>;

    all(
        userId: string,
        pageNumber: number,
        pageSize: number,
        tag: string | null
    ): Promise<any>;

    getContentById(userId: string, documentId: string): Promise<any>;

    save(
        userId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<any>;

    update(
        userId: string,
        documentId: string,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[],
        content: string
    ): Promise<any>;

    addTag(
        documentId: string,
        tag: { key: string; name: string }
    ): Promise<any>;

    download(link: string): Promise<any>;

    upload(
        userId: string,
        file: UploadedFile,
        fileName: string,
        fileExtension: string,
        contentType: string,
        tags: { key: string; name: string }[]
    ): Promise<any>;

    remove(
        user: {
            Id: string;
            userName: string;
            userRole: string;
        },
        documentId: string
    ): Promise<any>;
}
