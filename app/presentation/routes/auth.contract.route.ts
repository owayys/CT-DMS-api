import { implement } from "@orpc/server";
import { authContract } from "../contracts/auth.contract";
import {
    hydrateOrpcContext,
    orpcResponse,
    toOrpc,
} from "../middleware/orpc.middleware";
import { errorHandler } from "../middleware/error-handler.middleware";
import { AuthController } from "../controllers/auth.controller";

const pub = implement(authContract).use(hydrateOrpcContext);

// @ts-ignore
const authController = new AuthController();

export const authRouter = pub.router({
    generate: pub.generate
        .use(toOrpc(authController.generate))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
    refresh: pub.refresh
        .use(toOrpc(authController.refresh))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
});
