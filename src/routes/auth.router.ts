import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { requestValidator } from "../middleware/requestValidator";
import { authValidator } from "../middleware/authValidator";
import { getUserSchema, loginUserSchema, requestResetPasswordSchema, resetPasswordSchema, signupUserSchema, updateUserSchema, uploadAvatarSchema } from "../@types/requests/auth.req";
import { getSignedUrlSchema } from "../@types/requests";
import { CommonController } from "../controllers/common.controller";
import { CommonService } from "../services/common.service";

export const authRouter = Router();

const authController = new AuthController(new AuthService());
const commonController = new CommonController(new CommonService())

authRouter.post(
    "/signup",
    requestValidator(signupUserSchema),
    authController.createUser
);

authRouter.post("/signup/avatar", requestValidator(getSignedUrlSchema), commonController.getSignedUrl);

authRouter.post("/login", requestValidator(loginUserSchema), authController.loginUser);

authRouter.delete("/users", authValidator, authController.deleteUser);

authRouter.put("/users", requestValidator(updateUserSchema), authValidator, authController.updateUser);

authRouter.get("/logout", authValidator, authController.logoutUser);

authRouter.get("/me", authValidator, authController.fetchMe);

authRouter.get("/users/:userId", authValidator, requestValidator(getUserSchema), authController.getUser);

authRouter.get("/username/uniqueness/:username", authController.isUniqueUsername);

authRouter.post("/password/request", requestValidator(requestResetPasswordSchema), authController.requestForResetPassword);
authRouter.post("/password/reset", authValidator, requestValidator(resetPasswordSchema), authController.resetPassword);

