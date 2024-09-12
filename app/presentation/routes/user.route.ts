import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticate-jwt.middleware";
import { restrict } from "../middleware/restrict.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    CreateUser,
    GetAllUsers,
    GetUser,
    UpdateUser,
} from "../../lib/validators/user.validators";

const router = Router();
const userController = new UserController();

router.get(
    "/",
    authenticateJWT,
    validate(GetAllUsers),
    restrict("ADMIN"),
    userController.getAll
);
router.post("/", validate(CreateUser), userController.register);
router.get("/:id", authenticateJWT, validate(GetUser), userController.get);
router.put(
    "/:id",
    authenticateJWT,
    validate(UpdateUser),
    userController.update
);

export default router;
