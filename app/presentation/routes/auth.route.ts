import { RequestHandler, Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { AuthController } from "../controllers/auth.controller";
import { errorHandler } from "../middleware/error-handler.middleware";
import { LoginRequestDto } from "../../application/dtos/auth/login.request.dto";
import { expressResponse, toExpress } from "../middleware/express.middleware";

const router = Router();
// @ts-ignore
const authController = new AuthController();

router.post(
    "/refresh",
    toExpress(authController.refresh),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);
router.post(
    "/",
    toExpress(validate(LoginRequestDto)),
    toExpress(authController.generate),
    toExpress(errorHandler, true),
    expressResponse as RequestHandler
);

export default router;
