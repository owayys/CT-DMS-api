import { NextFunction, IResponse, IRequest, IRequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { Inject } from "../../lib/di/Inject";
import { DOCUMENT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";
import { Result } from "../../lib/util/result";
import { ArgumentNotProvidedException } from "../../lib/exceptions/exceptions";

@InjectionTarget()
export class DocumentController {
    constructor(
        @Inject(DOCUMENT_SERVICE) private documentService: any,
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user.Id;
            const result = await this.documentService.get(userId, id);

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    getAll: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user.Id;
            const { pageNumber, pageSize, tag } = req.query;

            const result = await this.documentService.getAll(
                // userId,
                pageNumber,
                pageSize,
                tag
            );

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    getContent: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user.Id;
            const result = await this.documentService.getContent(userId, id);

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    save: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                fileName,
                fileExtension,
                contentType,
                tags,
                content,
                meta,
            } = req.body;
            const userId = req.user.Id;

            const result = await this.documentService.save(
                userId,
                fileName,
                fileExtension,
                contentType,
                tags,
                content,
                meta || null
            );

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    upload: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                req.result = new Result(
                    null,
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
        } catch (err) {
            this.logger.warn(err);
        }
    };

    download: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { url } = req.params;

            const result = await this.documentService.download(url as string);

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    update: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { fileName, fileExtension, contentType, tags, content } =
                req.body;
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
        } catch (err) {
            this.logger.warn(err);
        }
    };

    remove: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const user = req.user;

            const result = await this.documentService.remove(user, id);

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    addTag: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { key, name } = req.body;

            const result = await this.documentService.addTag(id, { key, name });

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    updateTag: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { key, name } = req.body;

            const result = await this.documentService.updateTag(id, {
                key,
                name,
            });

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };

    removeTag: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { key, name } = req.body;
            const result = await this.documentService.removeTag(id, {
                key,
                name,
            });

            req.result = result;

            next();
        } catch (err) {
            this.logger.warn(err);
        }
    };
}
