import { Router } from "express";
import { signupSchema } from "../@types/req";
import { AuthController } from "../controllers/auth.controller";
import { verifyRequest } from "../middleware/verifyRequest";
import { AuthService } from "../services/auth.service";

export const router = Router();
const authController = new AuthController(new AuthService());
router.post("/auth/signup", verifyRequest(signupSchema), authController.signup);
