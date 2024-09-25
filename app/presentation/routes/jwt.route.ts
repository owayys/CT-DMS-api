import { RequestHandler, Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { JWTController } from "../controllers/jwt.controller";
import { errorHandler } from "../middleware/error-handler.middleware";
import { LoginRequestDto } from "../../application/dtos/auth/login.request.dto";

const router = Router();
// @ts-ignore
const jwtController = new JWTController();

router.post(
    "/refreshtoken",
    jwtController.refresh as RequestHandler,
    errorHandler as RequestHandler
);
router.post(
    "/",
    validate(LoginRequestDto),
    jwtController.generate as RequestHandler,
    errorHandler as RequestHandler
);

export default router;
