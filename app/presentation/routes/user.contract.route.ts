import { implement } from "@orpc/server";
import {
    hydrateOrpcContext,
    orpcResponse,
    toOrpc,
} from "../middleware/orpc.middleware";
import { authenticateJWT } from "../middleware/authenticate-jwt.middleware";
import { userContract } from "../contracts/user.contract";
import { UserController } from "../controllers/user.controller";
import { errorHandler } from "../middleware/error-handler.middleware";

const pub = implement(userContract).use(hydrateOrpcContext);
// @ts-ignore
const userController = new UserController();

const authed = pub.use(toOrpc(authenticateJWT));

export const userRouter = pub.router({
    create: authed.create
        .use(toOrpc(userController.register))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
    get: pub.get
        .use(toOrpc(userController.get))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
    getAll: authed.getAll
        .use(toOrpc(userController.getAll))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
    update: pub.update
        .use(toOrpc(userController.update))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
});
