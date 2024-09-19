import QueryString from "qs";
import { Result } from "../lib/util/result";

declare module "express" {
    export interface IRequest<
        P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = QueryString.ParsedQs,
        Locals extends Record<string, any> = Record<string, any>
    > extends Request {
        user: { Id: string; userName: string; userRole: string };
        result?: Result<any, Error>;
    }

    export interface IResponse extends Response {}

    export interface ParamsDictionary {
        [key: string | symbol]: string | object;
    }

    interface ParsedQs {
        [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
    }

    export interface IRequestHandler<
        P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>
    > {
        (
            req: IRequest<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
            res: Response<ResBody, LocalsObj>,
            next: NextFunction
        ): void;
    }
}

declare module "jsonwebtoken" {
    export interface UserJWTPayload extends JwtPayload {
        Id: string;
        userName: string;
        userRole: string;
    }
}
