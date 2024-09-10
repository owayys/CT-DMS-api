import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authenticateJWT } from "../../middleware/authenticateJWT";
import { restrict } from "../../middleware/restrict";
import { validate } from "../../middleware/validate";
import {
    CreateUser,
    GetAllUsers,
    GetUser,
    UpdateUser,
} from "../../lib/validators/userSchemas";

const router = Router();
const userController = new UserController();

router.get(
    "/",
    authenticateJWT,
    validate(GetAllUsers),
    restrict("ADMIN"),
    userController.getAll
);
router.post("/", validate(CreateUser), userController.save);
router.get("/:id", authenticateJWT, validate(GetUser), userController.get);
router.put(
    "/:id",
    authenticateJWT,
    validate(UpdateUser),
    userController.update
);

export default router;
