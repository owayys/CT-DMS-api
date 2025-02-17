import { RequestHandler, Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticateJWT } from "../middleware/authenticate-jwt.middleware";
import { DocumentController } from "../controllers/document.controller";
import { errorHandler } from "../middleware/error-handler.middleware";
import { CreateDocumentRequestDto } from "../../application/dtos/document/create-document.request.dto";
import { GetAllDocumentsRequestDto } from "../../application/dtos/document/get-all-documents.request.dto";
import { GetDocumentRequestDto } from "../../application/dtos/document/get-document.request.dto";
import { GetDocumentContentRequestDto } from "../../application/dtos/document/get-document-content.request.dto";
import { UpdateDocumentRequestDto } from "../../application/dtos/document/update-document.request.dto";
import { DeleteDocumentRequestDto } from "../../application/dtos/document/delete-document.request.dto";
import { AddTagRequestDto } from "../../application/dtos/document/add-tag.request.dto";
import { UpdateTagRequestDto } from "../../application/dtos/document/update-tag.request.dto";
import { DeleteTagRequestDto } from "../../application/dtos/document/delete-tag.request.dto";
import { restrict, UserRole } from "../middleware/restrict.middleware";
import { UpdateMetaRequestDto } from "../../application/dtos/document/update-meta.request.dto";
import { DeleteMetaRequestDto } from "../../application/dtos/document/delete-meta.request.dto";
import { expressResponse, toExpress } from "../middleware/express.middleware";

const router = Router();
// @ts-ignore
const documentController = new DocumentController();

router.get("/download/:url", toExpress(documentController.download));
router.get(
    "/content/:id",
    toExpress(authenticateJWT),
    toExpress(validate(GetDocumentContentRequestDto)),
    toExpress(documentController.getContent),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.post(
    "/upload",
    toExpress(authenticateJWT),
    toExpress(documentController.upload),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.post(
    "/:id/tag",
    toExpress(authenticateJWT),
    toExpress(validate(AddTagRequestDto)),
    toExpress(documentController.addTag),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.put(
    "/:id/tag",
    toExpress(authenticateJWT),
    toExpress(validate(UpdateTagRequestDto)),
    toExpress(documentController.updateTag),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.delete(
    "/:id/tag",
    toExpress(authenticateJWT),
    toExpress(validate(DeleteTagRequestDto)),
    toExpress(documentController.removeTag),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.put(
    "/:id/meta",
    toExpress(authenticateJWT),
    toExpress(validate(UpdateMetaRequestDto)),
    toExpress(documentController.updateMeta),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.delete(
    "/:id/meta",
    toExpress(authenticateJWT),
    toExpress(validate(DeleteMetaRequestDto)),
    toExpress(documentController.deleteMeta),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.get(
    "/:id",
    toExpress(authenticateJWT),
    toExpress(validate(GetDocumentRequestDto)),
    toExpress(documentController.get),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.put(
    "/:id",
    toExpress(authenticateJWT),
    toExpress(validate(UpdateDocumentRequestDto)),
    toExpress(documentController.update),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.delete(
    "/:id",
    toExpress(authenticateJWT),
    toExpress(validate(DeleteDocumentRequestDto)),
    toExpress(restrict(UserRole.ADMIN)),
    toExpress(documentController.remove),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.get(
    "/",
    toExpress(authenticateJWT),
    toExpress(validate(GetAllDocumentsRequestDto)),
    toExpress(restrict(UserRole.ADMIN)),
    toExpress(documentController.getAll),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.post(
    "/",
    toExpress(authenticateJWT),
    toExpress(validate(CreateDocumentRequestDto)),
    toExpress(documentController.save),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);

export default router;
