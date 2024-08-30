import { Request, Response, RequestHandler } from "express";
import { ZodError } from "zod";
import { ServiceFactory } from "../services";

const userService = new ServiceFactory().createUserService();

export const get: RequestHandler = async (
    req: Request,
    res: Response,
    next
) => {
    try {
        let userId = req.params.id;
        // let result = await userService.get(userId);
        let result = await userService.getAlt(userId);

        if (result.isErr()) {
            const err: Error | null = result.getErr();

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
        console.error(`Error while getting user`, err.message);
    }
};

type ReqDictionary = {};
type ReqBody = { foo1?: string };
type ResBody = { foo2?: string };
type ReqQuery = { pageNumber: string; pageSize: string };

export const getAll = async (
    req: Request<ReqDictionary, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: any
) => {
    try {
        let { pageNumber, pageSize } = req.query;
        let pageNumberParsed = parseInt(pageNumber) - 1 || 0;
        let pageSizeParsed = parseInt(pageSize) || 10;

        let result = await userService.getAll(pageNumberParsed, pageSizeParsed);

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
        console.error(`Error while getting all users`, err.message);
    }
};

export const save: RequestHandler = async (
    req: Request,
    res: Response,
    next
) => {
    try {
        console.log(req.body);
        let { userName, password } = req.body;
        let result = await userService.save(userName, password);
        if (result instanceof ZodError) {
            res.status(409).json({
                error: {
                    message: result.message,
                },
            });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(`Error while creating user`, err.message);
    }
};

export const update: RequestHandler = async (
    req: Request,
    res: Response,
    next
) => {
    try {
        let userId = req.params.id;
        let { password } = req.body;
        let result = await userService.update(userId, password);
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
        console.error(`Error while updating user`, err.message);
    }
};
