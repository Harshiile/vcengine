import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { requestValidator } from "../middleware/requestValidator";
import { loginSchema, signupSchema } from "../@types/req";

export const authRouter = Router();

const authController = new AuthController(new AuthService());

authRouter.post(
  "/signup",
  requestValidator(signupSchema),
  authController.signup
);

authRouter.post("/login", requestValidator(loginSchema), authController.login);

authRouter.post("/logout", authController.logout);

authRouter.get(
  "/user/:id",
  requestValidator(loginSchema),
  authController.getUser
);
authRouter.put(
  "/user/:id",
  requestValidator(loginSchema),
  authController.updateUser
);
