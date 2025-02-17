import {
    Request,
    Response,
    NextFunction,
    RequestHandler,
    IRequest,
    IResponse,
    ErrorRequestHandler,
} from "express";
import { AppContext, MiddlewareFunc } from "./types.middleware";

export const toExpress = (
    middleware: MiddlewareFunc,
    isHandler = false
): RequestHandler | ErrorRequestHandler => {
    return isHandler
        ? async (
              _err: any,
              req: Request & AppContext,
              _: Response,
              next: NextFunction
          ) => {
              Object.assign(req, await middleware(req));
              return next();
          }
        : async (
              req: Request & AppContext,
              _: Response,
              next: NextFunction
          ) => {
              if (req.result?.isErr()) {
                  return next(req.result.unwrapErr());
              }
              const middlewareResponse = await middleware(req);
              Object.assign(req, middlewareResponse);
              if (middlewareResponse.result?.isErr()) {
                  return next(middlewareResponse.result.unwrapErr());
              }
              return next();
          };
};

export const expressResponse = (
    req: IRequest & AppContext,
    res: IResponse,
    _next: NextFunction
) => {
    if (req.result?.isErr()) {
        const err = req.result.unwrapErr();
        res.status(req.status!).json({
            error: {
                message: err.message,
            },
        });
    } else {
        res.status(200).json(req.result?.unwrap());
    }
};
