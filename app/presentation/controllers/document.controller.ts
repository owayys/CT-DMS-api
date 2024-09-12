import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
    UserRequest,
} from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { ZodError } from "zod";
import { Inject } from "../../lib/di/Inject";
import { DOCUMENT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";

declare module "express" {
    export interface UserRequest extends Request {
        user: { Id: string; userName: string; userRole: string };
    }
}

@InjectionTarget()
export class DocumentController {
    constructor(
        @Inject(DOCUMENT_SERVICE) private documentService: any,
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: RequestHandler = async (
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user.Id;
            const result = await this.documentService.get(userId, id);

            if (result.isErr()) {
                const err: Error = result.getErr();

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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };

    getAll = async (req: any, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user.Id;
            const { pageNumber, pageSize, tag } = req.query;

            const result = await this.documentService.getAll(
                // userId,
                pageNumber,
                pageSize,
                tag
            );

            if (result.isErr()) {
                const err: Error = result.getErr();

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
            const { id } = req.params;
            const userId = req.user.Id;
            const result = await this.documentService.getContent(userId, id);

            if (result.isErr()) {
                const err: Error = result.getErr();

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

            if (result.isErr()) {
                const err: Error = result.getErr();
                console.log(err);
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
                console.log(result.unwrap());
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
            const { link } = req.query;

            const result = await this.documentService.download(link as string);

            if (result.isErr()) {
                const err: Error = result.getErr();

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

            if (result.isErr()) {
                const err: Error = result.getErr();

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
            const { id } = req.params;
            const user = req.user;

            const result = await this.documentService.remove(user, id);

            if (result.isErr()) {
                const err: Error = result.getErr();

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
            const { id } = req.params;
            const { key, name } = req.body;

            const result = await this.documentService.addTag(id, { key, name });

            if (result.isErr()) {
                const err: Error = result.getErr();

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
            const { id } = req.params;
            const { key, name } = req.body;

            const result = await this.documentService.updateTag(id, {
                key,
                name,
            });

            if (result.isErr()) {
                const err: Error = result.getErr();

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
            const { id } = req.params;
            const { key, name } = req.body;
            console.log(id, req.body);
            const result = await this.documentService.removeTag(id, {
                key,
                name,
            });

            if (result.isErr()) {
                const err: Error = result.getErr();

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
                res.status(200).json(result.unwrap());
            }
        } catch (err) {
            this.logger.warn(err);
        }
    };
}
