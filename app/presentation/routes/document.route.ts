import { Router } from "express";
// import * as documentController from "../controllers/document.controller";
import { validate } from "../../middleware/validate";
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
} from "../../lib/validators/documentSchemas";
import { authenticateJWT } from "../../middleware/authenticateJWT";
import { DocumentController } from "../controllers/document.controller";

const router = Router();
const documentController = new DocumentController();

router.get("/download", documentController.download);
router.get(
    "/content/:id",
    authenticateJWT,
    validate(GetDocumentContent),
    documentController.getContent
);
router.post("/upload", authenticateJWT, documentController.upload);
router.post(
    "/:id/tag",
    authenticateJWT,
    validate(AddTag),
    documentController.addTag
);
router.put(
    "/:id/tag",
    authenticateJWT,
    validate(UpdateTag),
    documentController.updateTag
);
router.delete(
    "/:id/tag",
    authenticateJWT,
    validate(DeleteTag),
    documentController.removeTag
);
router.get(
    "/:id",
    authenticateJWT,
    validate(GetDocument),
    documentController.get
);
router.put(
    "/:id",
    authenticateJWT,
    validate(UpdateDocument),
    documentController.update
);
router.delete(
    "/:id",
    authenticateJWT,
    validate(DeleteDocument),
    documentController.remove
);
router.get(
    "/",
    authenticateJWT,
    validate(GetAllDocuments),
    documentController.getAll
);
router.post(
    "/",
    authenticateJWT,
    validate(SaveDocument),
    documentController.save
);

export default router;
