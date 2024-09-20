import { NextFunction, IResponse, IRequest, IRequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { Inject } from "../../lib/di/Inject";
import { DOCUMENT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";
import { ArgumentNotProvidedException } from "../../lib/exceptions/exceptions";
import { ZodError } from "zod";
import { redisClient } from "../../infrastructure/database";
import { readFileSync } from "fs";
import { Services } from "../../application/services/types";
import { AppResult } from "@carbonteq/hexapp";

@InjectionTarget()
export class DocumentController {
    constructor(
        @Inject(DOCUMENT_SERVICE)
        private documentService: Services[typeof DOCUMENT_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params;
        const userId = req.user.Id;
        const result = await this.documentService.get(userId, id);

        req.result = result;

        next();
    };

    getAll: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const userId = req.user.Id;
        const { pageNumber, pageSize, tag } = req.query;

        const result = await this.documentService.getAll(
            // userId,
            pageNumber as unknown as number,
            pageSize as unknown as number,
            tag as unknown as string | null
        );

        req.result = result;

        next();
    };

    getContent: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params;
        const userId = req.user.Id;
        const result = await this.documentService.getContent(userId, id);

        req.result = result;

        next();
    };

    save: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const { fileName, fileExtension, contentType, tags, content, meta } =
            req.body;
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
    };

    upload: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
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
            let file = await redisClient.getBuffer(url);
            if (file === null) {
                file = readFileSync(`${requestedFile.filePath}`);
                await redisClient.set(
                    url,
                    readFileSync(`${requestedFile.filePath}`),
                    "EX",
                    60
                );
                res.status(200).download(
                    requestedFile.filePath,
                    requestedFile.fileName
                );
            }
            res.status(200);
            res.set({
                "Content-Disposition": `attachment; filename=${requestedFile.fileName}`,
            });
            res.end(file);
        }
    };

    update: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
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
    };

    remove: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params;
        const user = req.user;

        const result = await this.documentService.remove(user.Id, id);

        req.result = result;

        next();
    };

    addTag: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params;
        const { key, name } = req.body;

        const result = await this.documentService.addTag(id, { key, name });

        req.result = result;

        next();
    };

    updateTag: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next
    ): Promise<void> => {
        const { id } = req.params;
        const { key, name } = req.body;

        const result = await this.documentService.updateTag(id, {
            key,
            name,
        });

        req.result = result;

        next();
    };

    removeTag: IRequestHandler = async (
        req: IRequest,
        res: IResponse,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params;
        const { key, name } = req.body;
        const result = await this.documentService.removeTag(id, {
            key,
            name,
        });

        req.result = result;

        next();
    };
}
