import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { BaseController } from "./base.controller";
import { ENV } from "../config/env";
import z from "zod";
import { signupUserSchema, isUsernameUniqueSchema, uploadAvatarSchema, getUserSchema, updateUserSchema, resetPasswordSchema, requestResetPasswordSchema } from "../@types/requests/auth.req";
import { VCError } from "../utils/error";

// Types
type signupUserBody = z.infer<typeof signupUserSchema.shape.body>;
type uploadAvatarBody = z.infer<typeof uploadAvatarSchema.shape.body>;
type isUsernameUniqueParams = z.infer<typeof isUsernameUniqueSchema.shape.params>;
type getUserParams = z.infer<typeof getUserSchema.shape.params>;
type updateUserBody = z.infer<typeof updateUserSchema.shape.body>;
type resetPasswordBody = z.infer<typeof resetPasswordSchema.shape.body>;
type requestResetPasswordBody = z.infer<typeof requestResetPasswordSchema.shape.body>;



export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  // Signup the user
  createUser = (
    req: Request<{}, {}, signupUserBody>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {

      const { email, password, username, name, avatar } = req.body;

      // Service
      const { accessToken, user } = await this.authService.createUser(
        email,
        password,
        username,
        name,
        avatar
      );

      // Set the Cookie as 2 days Expiry
      res.cookie(ENV.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: Number(ENV.ACCESS_TOKEN_EXPIRY),
      });

      // Return User to client
      return { user }
    });
  };


  // Login the user
  loginUser = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {

      const { email, password } = req.body;

      // Service
      const { user, accessToken } = await this.authService.loginUser(
        email,
        password
      );

      // Set the Cookie as 2 days Expiry 
      res.cookie(ENV.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: Number(ENV.ACCESS_TOKEN_EXPIRY),
      });

      // Return User to client
      return { user }
    });
  };


  // Logout the user
  logoutUser = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      // Clear the cookie
      res.clearCookie(ENV.ACCESS_TOKEN_NAME);
    });
  };


  fetchMe = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const user = await this.authService.getUser(req.user);
      if (!user) return null;
      return {
        user
      }
    });
  };

  // Fetch user's data
  getUser = (req: Request<getUserParams>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const user = await this.authService.getUser(req.params.userId);
      if (!user) return null;
      return {
        user
      }
    });
  };


  // Check whether given username is unique or not
  isUniqueUsername = (req: Request<isUsernameUniqueParams>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      return (await this.authService.isUniqueUsername(req.params.username))
    });
  };

  // Update User
  updateUser = (req: Request<{}, {}, updateUserBody>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { avatarUrl, name, bio, location, website } = req.body
      await this.authService.updateUser(req.user, name, avatarUrl, bio, location, website);

      return {
        message: "User Updated!!"
      }
    });
  };

  // Delete User
  deleteUser = (req: Request<isUsernameUniqueParams>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      return (await this.authService.deleteUser(req.user))
    });
  };

  // Request for reset password
  requestForResetPassword = (req: Request<{}, {}, requestResetPasswordBody>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      return (await this.authService.requestForResetPassword(req.body.email))
    });
  };

  // Reset Password
  resetPassword = (req: Request<{}, {}, resetPasswordBody>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { confirmPassword, password } = req.body
      await this.authService.resetPassword(req.user, password, confirmPassword)
      return {
        message: "Password Changed !!"
      }
    });
  };
}
