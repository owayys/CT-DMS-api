import {
    Context,
    MergedContext,
    Middleware,
    MiddlewareOptions,
    ProcedureHandlerOptions,
} from "@orpc/server";
import { AppContext, MiddlewareFunc } from "./types.middleware";
import {
    Meta,
    ORPCErrorConstructorMap,
    Schema,
    SchemaInput,
    SchemaOutput,
} from "@orpc/contract";
import { UploadedFile } from "express-fileupload";
import { writeFile } from "fs/promises";

export const toOrpc = <
    InputSchema extends Schema,
    OutputSchema extends Schema,
    ReturnType
>(
    middleware: MiddlewareFunc<ReturnType>
): Middleware<
    MergedContext<Context, AppContext>,
    MergedContext<Context, AppContext<ReturnType>>,
    SchemaInput<InputSchema, any>,
    SchemaOutput<OutputSchema, any>,
    ORPCErrorConstructorMap<Omit<{}, never>>,
    {}
> => {
    return async (
        opts: MiddlewareOptions<
            AppContext,
            SchemaOutput<OutputSchema, any>,
            {},
            {}
        >
    ) => {
        if (opts.context.result?.isErr()) {
            return opts.next(opts);
        }

        const middlewareResponse = await middleware(opts.context);

        return opts.next({
            ...opts,
            context: middlewareResponse,
        });
    };
};

export const hydrateOrpcContext = async <
    T extends MiddlewareOptions<AppContext, SchemaOutput<Schema, any>, {}, {}>
>(
    opts: T
) => {
    const input = (opts as T & { input?: any }).input;

    return opts?.next({
        ...opts,
        context: {
            ...opts?.context,
            body: { ...opts?.context.body, ...input },
        },
    });
};

export const convertUploadedFile = async <
    T extends MiddlewareOptions<AppContext, SchemaOutput<Schema, any>, {}, {}>
>(
    opts: T
) => {
    const input = (opts as T & { input?: any }).input;

    if (input.file) {
        const file = input.file as File;
        const uploadedFile: UploadedFile = {
            name: file.name,
            data: Buffer.from(await file.arrayBuffer()),
            mimetype: file.type,
            size: file.size,
            tempFilePath: "",
            mv: async (path: string) => await writeFile(path, file.stream()),
            encoding: "utf-8",
            truncated: false,
            md5: "hash",
        };
        input.file = uploadedFile;
    }

    return opts?.next({
        ...opts,
        context: {
            ...opts?.context,
            body: { ...opts?.context.body, ...input },
        },
    });
};

export function orpcResponse<OutputSchema extends Schema>(
    opts: ProcedureHandlerOptions<
        MergedContext<Context, AppContext>,
        SchemaOutput<OutputSchema>,
        ORPCErrorConstructorMap<any>,
        Meta
    >
) {
    if (opts.context.result?.isErr()) {
        const err = opts.context.result.unwrapErr();
        return { error: { message: err.message } };
    }

    return opts.context.result?.unwrap();
}
