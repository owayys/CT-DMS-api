import { Request, RequestHandler, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { ZodError } from "zod";
import { ServiceFactory } from "../services";

const documentService = new ServiceFactory().createDocumentService();

export const get: RequestHandler = async (
    req: any,
    res: Response,
    next
): Promise<void> => {
    try {
        let { id } = req.params;
        let userId = req.user.Id;
        let result = await documentService.get(userId, id);

        if (result instanceof ZodError) {
            res.status(404).json({
                error: {
                    message: JSON.parse(result.message),
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error getting document`, err.message);
    }
};

export const getAll = async (
    req: any,
    res: Response,
    next: any
): Promise<void> => {
    try {
        let userId = req.user.Id;
        let { pageNumber, pageSize, tag } = req.query;
        let pageNumberParsed = pageNumber ? parseInt(pageNumber) - 1 : 0;
        let pageSizeParsed = pageSize ? parseInt(pageSize) : 10;

        let result = await documentService.getAll(
            userId,
            pageNumberParsed,
            pageSizeParsed,
            tag
        );

        if (result instanceof ZodError) {
            res.status(404).json({
                error: {
                    message: JSON.parse(result.message),
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error getting all documents`, err.message);
    }
};

export const getContent: RequestHandler = async (
    req: any,
    res: Response,
    next
): Promise<void> => {
    try {
        let { id } = req.params;
        let userId = req.user.Id;
        let result = await documentService.getContent(userId, id);

        if (result instanceof ZodError) {
            res.status(404).json({
                error: {
                    message: "Document not found",
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error getting document content`, err.message);
    }
};

export const save: RequestHandler = async (
    req: any,
    res: Response,
    next
): Promise<void> => {
    try {
        let { fileName, fileExtension, contentType, tags, content } = req.body;
        let userId = req.user.Id;

        let result = await documentService.save(
            userId,
            fileName,
            fileExtension,
            contentType,
            tags,
            content
        );

        if (result instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: result.message,
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error saving document`, err.message);
    }
};

export const upload: RequestHandler = async (
    req: any,
    res: Response,
    next
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

            let result = await documentService.upload(
                userId,
                file,
                fileName,
                fileExtension,
                contentType,
                tags
            );

            if (result instanceof ZodError) {
                res.status(422).json({
                    error: {
                        message: result.message,
                    },
                });
            } else {
                res.status(200).json(result);
            }
        }
    } catch (err) {
        console.error(`Error uploading document`, err.message);
    }
};

export const download: RequestHandler = async (
    req: Request,
    res: Response,
    next
): Promise<void> => {
    try {
        let { link } = req.query;

        let result = await documentService.download(link as string);

        if (result) {
            res.status(200).download(result.filePath, result.fileName);
        } else {
            res.status(410).json({
                error: {
                    message: "Download link expired or invalid",
                },
            });
        }
    } catch (err) {
        console.error(`Error downloading file`, err.message);
    }
};

export const update: RequestHandler = async (
    req: any,
    res: Response,
    next
): Promise<void> => {
    try {
        let { fileName, fileExtension, contentType, tags, content } = req.body;
        let { id } = req.params;
        let userId = req.user.Id;

        let result = await documentService.update(
            id,
            userId,
            fileName,
            fileExtension,
            contentType,
            tags,
            content
        );

        if (result instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: result.message,
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error updating document`, err.message);
    }
};

export const remove: RequestHandler = async (
    req: any,
    res: Response,
    next
): Promise<void> => {
    try {
        let { id } = req.params;
        let user = req.user;

        let result = await documentService.remove(id, user);

        if (result instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: result.message,
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error deleting document`, err.message);
    }
};

export const addTag: RequestHandler = async (
    req: Request,
    res: Response,
    next
): Promise<void> => {
    try {
        let { id } = req.params;
        let { key, name } = req.body;
        console.log(id, req.body);
        let result = await documentService.addTag(id, { key, name });

        if (result instanceof ZodError) {
            res.status(422).json({
                error: {
                    message: result.message,
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error Adding Tag`, err.message);
    }
};

export const updateTag: RequestHandler = (
    req: Request,
    res: Response,
    next
): void => {};

export const removeTag: RequestHandler = (
    req: Request,
    res: Response,
    next
): void => {};
