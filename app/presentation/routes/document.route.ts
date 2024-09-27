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
import { restrict, UserRoles } from "../middleware/restrict.middleware";
import { UpdateMetaRequestDto } from "../../application/dtos/document/update-meta.request.dto";
import { DeleteMetaRequestDto } from "../../application/dtos/document/delete-meta.request.dto";

const router = Router();
// @ts-ignore
const documentController = new DocumentController();

router.get("/download/:url", documentController.download as RequestHandler);
router.get(
    "/content/:id",
    authenticateJWT as RequestHandler,
    validate(GetDocumentContentRequestDto),
    documentController.getContent as RequestHandler,
    errorHandler as RequestHandler
);
router.post(
    "/upload",
    authenticateJWT as RequestHandler,
    documentController.upload as RequestHandler,
    errorHandler as RequestHandler
);
router.post(
    "/:id/tag",
    authenticateJWT as RequestHandler,
    validate(AddTagRequestDto),
    documentController.addTag as RequestHandler,
    errorHandler as RequestHandler
);
router.put(
    "/:id/tag",
    authenticateJWT as RequestHandler,
    validate(UpdateTagRequestDto),
    documentController.updateTag as RequestHandler,
    errorHandler as RequestHandler
);
router.delete(
    "/:id/tag",
    authenticateJWT as RequestHandler,
    validate(DeleteTagRequestDto),
    documentController.removeTag as RequestHandler,
    errorHandler as RequestHandler
);
router.put(
    "/:id/meta",
    authenticateJWT as RequestHandler,
    validate(UpdateMetaRequestDto),
    documentController.updateMeta as RequestHandler,
    errorHandler as RequestHandler
);
router.delete(
    "/:id/meta",
    authenticateJWT as RequestHandler,
    validate(DeleteMetaRequestDto),
    documentController.deleteMeta as RequestHandler,
    errorHandler as RequestHandler
);
router.get(
    "/:id",
    authenticateJWT as RequestHandler,
    validate(GetDocumentRequestDto),
    documentController.get as RequestHandler,
    errorHandler as RequestHandler
);
router.put(
    "/:id",
    authenticateJWT as RequestHandler,
    validate(UpdateDocumentRequestDto),
    documentController.update as RequestHandler,
    errorHandler as RequestHandler
);
router.delete(
    "/:id",
    authenticateJWT as RequestHandler,
    validate(DeleteDocumentRequestDto),
    restrict(UserRoles.ADMIN) as RequestHandler,
    documentController.remove as RequestHandler,
    errorHandler as RequestHandler
);
router.get(
    "/",
    authenticateJWT as RequestHandler,
    validate(GetAllDocumentsRequestDto),
    restrict(UserRoles.ADMIN) as RequestHandler,
    documentController.getAll as RequestHandler,
    errorHandler as RequestHandler
);
router.post(
    "/",
    authenticateJWT as RequestHandler,
    validate(CreateDocumentRequestDto),
    documentController.save as RequestHandler,
    errorHandler as RequestHandler
);

export default router;
