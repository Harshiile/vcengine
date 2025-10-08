import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { requestValidator } from "../middleware/requestValidator";
import { authValidator } from "../middleware/authValidator";
import { getAvatarSchema, loginUserSchema, signupUserSchema, uploadAvatarSchema } from "../@types/requests/auth.req";

export const authRouter = Router();

const authController = new AuthController(new AuthService());

authRouter.post(
  "/signup",
  requestValidator(signupUserSchema),
  authController.signup
);

authRouter.post("/login", requestValidator(loginUserSchema), authController.login);

authRouter.post("/upload-avatar", requestValidator(uploadAvatarSchema), authController.uploadAvatar);

authRouter.get("/logout", authValidator, authController.logout);

authRouter.get("/user", authValidator, authController.getUser);

authRouter.get("/unique-username/:username", authController.isUniqueUsername);

