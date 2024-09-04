import { Router } from "express";
// import * as documentController from "../controllers/document.controller";
import { validate } from "../middleware/validate";
import {
    AddTag,
    DeleteTag,
    GetAllDocuments,
    SaveDocument,
    UpdateDocument,
} from "../lib/validators/documentSchemas";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { DocumentController } from "../controllers/document.controller";

const router = Router();
const documentController = new DocumentController();

router.get("/download", documentController.download);
router.get("/content/:id", authenticateJWT, documentController.getContent);
router.post("/upload", authenticateJWT, documentController.upload);
router.post(
    "/:id/tag",
    authenticateJWT,
    validate(AddTag),
    documentController.addTag
);
router.delete(
    "/:id/tag",
    authenticateJWT,
    validate(DeleteTag),
    documentController.removeTag
);
router.get("/:id", authenticateJWT, documentController.get);
router.put(
    "/:id",
    authenticateJWT,
    validate(UpdateDocument),
    documentController.update
);
router.delete("/:id", authenticateJWT, documentController.remove);
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
