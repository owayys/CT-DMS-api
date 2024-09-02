import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export const validate = (schema: z.ZodObject<any, any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = response.body;
            req.query = response.query;
            req.params = response.params;
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const errorMessages = err.errors.map((issue: any) => ({
                    message: `${issue.message}`,
                }));
                res.status(422).json({
                    error: "Invalid data",
                    details: errorMessages,
                });
            } else {
                res.status(500).json({
                    error: "Internal Server Error",
                });
            }
        }
    };
};
