import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { JwtRequestUser } from "../../lib/validators/jwt.validators";
import { JWTController } from "../controllers/jwt.controller";
import { errorHandler } from "../middleware/error-handler.middleware";

const router = Router();
const jwtController = new JWTController();

router.post("/refreshtoken", jwtController.refresh, errorHandler);
router.post(
    "/",
    validate(JwtRequestUser),
    jwtController.generate,
    errorHandler
);

export default router;
