import * as userController from "../controllers/user.controller";
import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { restrict } from "../middleware/restrict";
import { validate } from "../middleware/validate";
import {
    CreateUser,
    GetAllUsers,
    UpdateUser,
} from "../lib/validators/userSchemas";

const router = Router();

router.get(
    "/",
    authenticateJWT,
    validate(GetAllUsers),
    restrict("ADMIN"),
    userController.getAll
);
router.post("/", validate(CreateUser), userController.save);
router.get("/:id", authenticateJWT, userController.get);
router.put(
    "/:id",
    authenticateJWT,
    validate(UpdateUser),
    userController.update
);

export default router;
