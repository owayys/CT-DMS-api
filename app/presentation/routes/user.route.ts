import { UserController } from "../controllers/user.controller";
import { RequestHandler, Router } from "express";
import { authenticateJWT } from "../middleware/authenticate-jwt.middleware";
import { restrict, UserRoles } from "../middleware/restrict.middleware";
import { validate } from "../middleware/validate.middleware";
import { errorHandler } from "../middleware/error-handler.middleware";
import { GetUserRequestDto } from "../../application/dtos/user/get-user.request.dto";
import { CreateUserRequestDto } from "../../application/dtos/user/create-user.request.dto";
import { GetAllUsersRequestDto } from "../../application/dtos/user/get-all-users.request.dto";
import { UpdateUserRequestDto } from "../../application/dtos/user/update-user.request.dto";

const router = Router();
// @ts-ignore
const userController = new UserController();

router.get(
    "/",
    authenticateJWT as RequestHandler,
    validate(GetAllUsersRequestDto),
    restrict(UserRoles.ADMIN) as RequestHandler,
    userController.getAll as RequestHandler,
    errorHandler as RequestHandler
);
router.post(
    "/",
    validate(CreateUserRequestDto),
    userController.register as RequestHandler,
    errorHandler as RequestHandler
);
router.get(
    "/:id",
    authenticateJWT as RequestHandler,
    validate(GetUserRequestDto),
    userController.get as RequestHandler,
    errorHandler as RequestHandler
);
router.put(
    "/:id",
    authenticateJWT as RequestHandler,
    validate(UpdateUserRequestDto),
    userController.update as RequestHandler,
    errorHandler as RequestHandler
);

export default router;
