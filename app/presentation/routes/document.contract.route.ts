import { implement } from "@orpc/server";
import { documentContract } from "../contracts/document.contract";
import {
    convertUploadedFile,
    hydrateOrpcContext,
    orpcResponse,
    toOrpc,
} from "../middleware/orpc.middleware";
import { authenticateJWT } from "../middleware/authenticate-jwt.middleware";
import { DocumentController } from "../controllers/document.controller";
import { errorHandler } from "../middleware/error-handler.middleware";

const pub = implement(documentContract).use(hydrateOrpcContext);
// @ts-ignore
const documentController = new DocumentController();

const authed = pub.use(toOrpc(authenticateJWT));

export const documentRouter = pub.router({
    get: authed.get
        .use(toOrpc(documentController.get))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
    upload: authed.upload
        .use(convertUploadedFile)
        .use(toOrpc(documentController.upload))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
    getAll: authed.getAll
        .use(toOrpc(documentController.getAll))
        .use(toOrpc(errorHandler))
        .handler(orpcResponse),
});
