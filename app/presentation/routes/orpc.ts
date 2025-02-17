import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { z } from "zod";
import { Context, os } from "@orpc/server";
import { UserEntitySchema } from "../../domain/entities/user/user.schema";
import { AppContext } from "../middleware/types.middleware";

export interface ORPCContext
    extends ResponseHeadersPluginContext,
        Context,
        AppContext {
    user?: z.infer<typeof UserEntitySchema>;
}

export const base = os.$context();

export const pub = base.use(async ({ context, path, next }, input) => {
    const start = performance.now();

    try {
        return await next({});
    } finally {
        console.log(
            `[${path.join("/")}] ${(performance.now() - start).toFixed(3)}ms`
        );
    }
});
