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
import { errorHandler } from "../middleware/error-handler.middleware";

const router = Router();
const userController = new UserController();

router.get(
    "/",
    authenticateJWT,
    validate(GetAllUsers),
    restrict("ADMIN"),
    userController.getAll,
    errorHandler
);
router.post("/", validate(CreateUser), userController.register, errorHandler);
router.get(
    "/:id",
    authenticateJWT,
    validate(GetUser),
    userController.get,
    errorHandler
);
router.put(
    "/:id",
    authenticateJWT,
    validate(UpdateUser),
    userController.update,
    errorHandler
);

export default router;
