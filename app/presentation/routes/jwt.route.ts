import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { JwtRequestUser } from "../../lib/validators/jwt.validators";
import { JWTController } from "../controllers/jwt.controller";

const router = Router();
const jwtController = new JWTController();

router.post("/refreshtoken", jwtController.refresh);
router.post("/", validate(JwtRequestUser), jwtController.generate);

export default router;
