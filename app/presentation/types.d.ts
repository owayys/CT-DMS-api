import QueryString from "qs";
import { Result } from "../lib/util/result";
import {
    DOCUMENT_SERVICE,
    JWT_SERVICE,
    USER_SERVICE,
} from "../lib/di/di.tokens";
import { DocumentService } from "../application/services/document.service";
import { UserService } from "../application/services/user.service";
import { JWTService } from "../application/services/jwt.service";

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

export type Services = {
    [DOCUMENT_SERVICE]: DocumentService;
    [USER_SERVICE]: UserService;
    [JWT_SERVICE]: JWTService;
};
