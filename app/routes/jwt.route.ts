import { Router } from "express";
import * as jwtController from "../controllers/jwt.controller";
import { validate } from "../middleware/validate";
import { JwtRequestUser } from "../lib/validators/JWTSchemas";

const router = Router();

router.post("/refreshtoken", jwtController.refresh);
router.post("/", validate(JwtRequestUser), jwtController.generate);

export default router;
