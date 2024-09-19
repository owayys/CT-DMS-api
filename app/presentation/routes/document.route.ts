import { Router } from "express";
// import * as documentController from "../controllers/document.controller";
import { validate } from "../middleware/validate.middleware";
import {
    AddTag,
    DeleteDocument,
    DeleteTag,
    GetAllDocuments,
    GetDocument,
    GetDocumentContent,
    SaveDocument,
    UpdateDocument,
    UpdateTag,
} from "../../lib/validators/document.validators";
import { authenticateJWT } from "../middleware/authenticate-jwt.middleware";
import { DocumentController } from "../controllers/document.controller";
import { errorHandler } from "../middleware/error-handler.middleware";

const router = Router();
const documentController = new DocumentController();

router.get("/download/:url", documentController.download);
router.get(
    "/content/:id",
    authenticateJWT,
    validate(GetDocumentContent),
    documentController.getContent,
    errorHandler
);
router.post(
    "/upload",
    authenticateJWT,
    documentController.upload,
    errorHandler
);
router.post(
    "/:id/tag",
    authenticateJWT,
    validate(AddTag),
    documentController.addTag,
    errorHandler
);
router.put(
    "/:id/tag",
    authenticateJWT,
    validate(UpdateTag),
    documentController.updateTag,
    errorHandler
);
router.delete(
    "/:id/tag",
    authenticateJWT,
    validate(DeleteTag),
    documentController.removeTag,
    errorHandler
);
router.get(
    "/:id",
    authenticateJWT,
    validate(GetDocument),
    documentController.get,
    errorHandler
);
router.put(
    "/:id",
    authenticateJWT,
    validate(UpdateDocument),
    documentController.update,
    errorHandler
);
router.delete(
    "/:id",
    authenticateJWT,
    validate(DeleteDocument),
    documentController.remove,
    errorHandler
);
router.get(
    "/",
    authenticateJWT,
    validate(GetAllDocuments),
    documentController.getAll,
    errorHandler
);
router.post(
    "/",
    authenticateJWT,
    validate(SaveDocument),
    documentController.save,
    errorHandler
);

export default router;
