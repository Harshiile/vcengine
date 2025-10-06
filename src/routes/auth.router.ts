import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { requestValidator } from "../middleware/requestValidator";
import { loginSchema, signupSchema } from "../@types/req";
import { authValidator } from "../middleware/authValidator";
import { getAvatarSchema, uploadAvatarSchema } from "../@types/req/auth.req";

export const authRouter = Router();

const authController = new AuthController(new AuthService());

authRouter.post(
  "/signup",
  requestValidator(signupSchema),
  authController.signup
);

authRouter.post("/login", requestValidator(loginSchema), authController.login);

authRouter.post("/upload-avatar", requestValidator(uploadAvatarSchema), authController.uploadAvatar);

authRouter.get("/avatar/:userId", requestValidator(getAvatarSchema), authController.getAvatar);

authRouter.post("/logout", authValidator, authController.logout);

authRouter.get("/user", authValidator, authController.getUser);

authRouter.put("/user/:id", authController.updateUser);
