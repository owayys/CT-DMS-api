import { NextFunction, IResponse, IRequest, IRequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { Inject } from "../../lib/di/Inject";
import { DOCUMENT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";
import { ArgumentNotProvidedException } from "../../lib/exceptions/exceptions";
import { ZodError } from "zod";
import { Services } from "../../application/services/types";
import { AppResult } from "@carbonteq/hexapp";
import { GetDocumentRequestDto } from "../../application/dtos/document/get-document.request.dto";
import { GetAllDocumentsRequestDto } from "../../application/dtos/document/get-all-documents.request.dto";
import { CreateDocumentRequestDto } from "../../application/dtos/document/create-document.request.dto";
import { UserDefinedMetadata } from "../../domain/types/document.types";
import { UpdateDocumentRequestDto } from "../../application/dtos/document/update-document.request.dto";
import { GetDocumentContentRequestDto } from "../../application/dtos/document/get-document-content.request.dto";
import { DeleteDocumentRequestDto } from "../../application/dtos/document/delete-document.request.dto";
import { AddTagRequestDto } from "../../application/dtos/document/add-tag.request.dto";
import { UpdateTagRequestDto } from "../../application/dtos/document/update-tag.request.dto";
import { DeleteTagRequestDto } from "../../application/dtos/document/delete-tag.request.dto";

@InjectionTarget()
export class DocumentController {
    constructor(
        @Inject(DOCUMENT_SERVICE)
        private documentService: Services[typeof DOCUMENT_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const userId = req.user.Id;
        const command: GetDocumentRequestDto = req.body;
        const { id } = command;
        const result = await this.documentService.get(userId, id);

        req.result = result;

        next();
    };

    getAll: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const command: GetAllDocumentsRequestDto = req.body;
        const { pageNumber, pageSize, filterBy } = command;

        const result = await this.documentService.getAll(
            pageNumber,
            pageSize,
            filterBy
        );

        req.result = result;

        next();
    };

    getContent: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const command: GetDocumentContentRequestDto = req.body;
        const { id } = command;
        const userId = req.user.Id;
        const result = await this.documentService.getContent(userId, id);

        req.result = result;

        next();
    };

    save: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const command: CreateDocumentRequestDto = req.body;
        const { fileName, fileExtension, contentType, tags, content, meta } =
            command;
        const userId = req.user.Id;

        const result = await this.documentService.save(
            userId,
            fileName,
            fileExtension,
            contentType,
            tags,
            content,
            meta as UserDefinedMetadata
        );

        req.result = result;

        next();
    };

    upload: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        if (!req.files || Object.keys(req.files).length === 0) {
            req.result = AppResult.Err(
                new ArgumentNotProvidedException("No file uploaded")
            );
            next();
        } else {
            const file = req.files.file as UploadedFile;

            const fileName = path.parse(file.name).name;
            const fileExtension = path.parse(file.name).ext;

            const contentType = file.mimetype;

            let { tags } = req.body;
            tags = JSON.parse(tags);

            const userId = req.user.Id;

            const result = await this.documentService.upload(
                userId,
                file,
                fileName,
                fileExtension,
                contentType,
                tags
            );

            req.result = result;

            next();
        }
    };

    download: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const { url } = req.params;

        const result = await this.documentService.download(url as string);

        req.result = result;

        if (result.isErr()) {
            const err: Error = result.unwrapErr();

            if (err instanceof ZodError) {
                res.status(422).json({
                    error: {
                        message: JSON.parse(err.message),
                    },
                });
            } else {
                res.status(404).json({
                    error: {
                        message: err.message,
                    },
                });
            }
        } else {
            const requestedFile = result.unwrap();
            res.status(200).download(
                requestedFile.filePath,
                requestedFile.fileName
            );
        }
    };

    update: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const command: UpdateDocumentRequestDto = req.body;
        const { fileName, fileExtension, contentType, tags, content } = command;
        const { id } = req.params;
        const userId = req.user.Id;

        const result = await this.documentService.update(
            userId,
            id,
            fileName,
            fileExtension,
            contentType,
            tags,
            content
        );

        req.result = result;

        next();
    };

    remove: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const command: DeleteDocumentRequestDto = req.body;
        const { id } = command;
        const userId = req.user.Id;

        const result = await this.documentService.remove(userId, id);

        req.result = result;

        next();
    };

    addTag: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const command: AddTagRequestDto = req.body;
        const { id, tag } = command;

        const result = await this.documentService.addTag(id, tag);

        req.result = result;

        next();
    };

    updateTag: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next
    ): Promise<void> => {
        const command: UpdateTagRequestDto = req.body;
        const { id, tag } = command;

        const result = await this.documentService.updateTag(id, tag);

        req.result = result;

        next();
    };

    removeTag: IRequestHandler = async (
        req: IRequest,
        _res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const command: DeleteTagRequestDto = req.body;
        const { id, tag } = command;

        const result = await this.documentService.removeTag(id, tag);

        req.result = result;

        next();
    };
}
