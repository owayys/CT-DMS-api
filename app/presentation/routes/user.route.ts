import { UserController } from "../controllers/user.controller";
import { RequestHandler, Router } from "express";
import { authenticateJWT } from "../middleware/authenticate-jwt.middleware";
import { restrict, UserRole } from "../middleware/restrict.middleware";
import { validate } from "../middleware/validate.middleware";
import { errorHandler } from "../middleware/error-handler.middleware";
import { GetUserRequestDto } from "../../application/dtos/user/get-user.request.dto";
import { CreateUserRequestDto } from "../../application/dtos/user/create-user.request.dto";
import { GetAllUsersRequestDto } from "../../application/dtos/user/get-all-users.request.dto";
import { UpdateUserRequestDto } from "../../application/dtos/user/update-user.request.dto";
import { expressResponse, toExpress } from "../middleware/express.middleware";

const router = Router();
// @ts-ignore
const userController = new UserController();

router.get(
    "/",
    toExpress(authenticateJWT),
    toExpress(validate(GetAllUsersRequestDto)),
    toExpress(restrict(UserRole.ADMIN)),
    toExpress(userController.getAll),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.post(
    "/",
    toExpress(validate(CreateUserRequestDto)),
    toExpress(userController.register),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.get(
    "/:id",
    toExpress(authenticateJWT),
    toExpress(validate(GetUserRequestDto)),
    toExpress(userController.get),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.put(
    "/:id",
    toExpress(authenticateJWT),
    toExpress(validate(UpdateUserRequestDto)),
    toExpress(userController.update),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);

export default router;
