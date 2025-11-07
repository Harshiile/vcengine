import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { requestValidator } from "../middleware/requestValidator";
import { authValidator } from "../middleware/authValidator";
import { getUserSchema, loginUserSchema, requestResetPasswordSchema, resetPasswordSchema, signupUserSchema, updateUserSchema, uploadAvatarSchema } from "../@types/requests/auth.req";

export const authRouter = Router();

const authController = new AuthController(new AuthService());

authRouter.post(
    "/signup",
    requestValidator(signupUserSchema),
    authController.createUser
);

authRouter.post("/login", requestValidator(loginUserSchema), authController.loginUser);

authRouter.delete("/users", authValidator, authController.deleteUser);

authRouter.put("/users", requestValidator(updateUserSchema), authValidator, authController.updateUser);

authRouter.post("/upload-avatar", requestValidator(uploadAvatarSchema), authController.uploadAvatar);

authRouter.get("/logout", authValidator, authController.logoutUser);

authRouter.get("/me", authValidator, authController.fetchMe);
authRouter.get("/users/:userId", authValidator, requestValidator(getUserSchema), authController.getUser);

authRouter.get("/username/uniqueness/:username", authController.isUniqueUsername);

authRouter.post("/password/request", requestValidator(requestResetPasswordSchema), authController.requestForResetPassword);
authRouter.post("/password/reset", authValidator, requestValidator(resetPasswordSchema), authController.resetPassword);

