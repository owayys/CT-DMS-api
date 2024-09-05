import { NextFunction, Request, RequestHandler, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { ZodError } from "zod";
import { Inject } from "../lib/di/Inject";
import { DOCUMENT_SERVICE, LOGGER } from "../lib/di/di.tokens";
import { InjectionTarget } from "../lib/di/InjectionTarget";
import { ILogger } from "../lib/logging/ILogger";

@InjectionTarget()
export class DocumentController {
    constructor(
        @Inject(DOCUMENT_SERVICE) private documentService: any,
        @Inject(LOGGER) private logger: ILogger | any
    ) {}

    get: RequestHandler = async (
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { id } = req.params;
            let userId = req.user.Id;
            let result = await this.documentService.get(userId, id);

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    getAll = async (req: any, res: Response, next: any): Promise<void> => {
        try {
            let userId = req.user.Id;
            let { pageNumber, pageSize, tag } = req.query;

            let result = await this.documentService.getAll(
                userId,
                pageNumber - 1,
                pageSize,
                tag
            );

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    getContent: RequestHandler = async (
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { id } = req.params;
            let userId = req.user.Id;
            let result = await this.documentService.getContent(userId, id);

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    save: RequestHandler = async (
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { fileName, fileExtension, contentType, tags, content } =
                req.body;
            let userId = req.user.Id;

            let result = await this.documentService.save(
                userId,
                fileName,
                fileExtension,
                contentType,
                tags,
                content
            );

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    upload: RequestHandler = async (
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                res.status(400).send("No files were uploaded.");
            } else {
                let file = req.files.file as UploadedFile;

                let fileName = path.parse(file.name).name;
                let fileExtension = path.parse(file.name).ext;

                let contentType = file.mimetype;

                let { tags } = req.body;
                tags = JSON.parse(tags);

                let userId = req.user.Id;

                let result = await this.documentService.upload(
                    userId,
                    file,
                    fileName,
                    fileExtension,
                    contentType,
                    tags
                );

                if (result.isErr()) {
                    const err: Error = result.getErr();

                    if (err instanceof ZodError) {
                        res.status(404).json({
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
                    res.status(200).json(result.unwrap());
                }
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    download: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { link } = req.query;

            let result = await this.documentService.download(link as string);

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
        } catch (err) {
            this.logger.warn(err);
        }
    };

    update: RequestHandler = async (
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { fileName, fileExtension, contentType, tags, content } =
                req.body;
            let { id } = req.params;
            let userId = req.user.Id;

            let result = await this.documentService.update(
                userId,
                id,
                fileName,
                fileExtension,
                contentType,
                tags,
                content
            );

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    remove: RequestHandler = async (
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { id } = req.params;
            let user = req.user;

            let result = await this.documentService.remove(user, id);

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    addTag: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { id } = req.params;
            let { key, name } = req.body;

            let result = await this.documentService.addTag(id, { key, name });

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    updateTag: RequestHandler = async (
        req: Request,
        res: Response,
        next
    ): Promise<void> => {
        try {
            let { id } = req.params;
            let { key, name } = req.body;

            const result = await this.documentService.updateTag(id, {
                key,
                name,
            });

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    removeTag: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let { id } = req.params;
            let { key, name } = req.body;
            console.log(id, req.body);
            let result = await this.documentService.removeTag(id, {
                key,
                name,
            });

            if (result.isErr()) {
                const err: Error = result.getErr();

                if (err instanceof ZodError) {
                    res.status(404).json({
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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };
}
