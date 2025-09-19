import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { BaseController } from "./base.controller";
import { ENV } from "../config/env";
import z from "zod";
import { signupSchema } from "../@types/req";

type signupBody = z.infer<typeof signupSchema.shape.body>;

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  signup = (
    req: Request<{}, {}, signupBody>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { email, password, username, name, avatar } = req.body;
      const { accessToken, uploadAvatarUrl } = await this.authService.signup(
        email,
        password,
        username,
        name,
        avatar
      );

      res.cookie(ENV.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: Number(ENV.ACCESS_TOKEN_EXPIRY),
      });

      return { uploadAvatarUrl };
    });
  };

  login = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { email, password } = req.body;
      const { user, accessToken } = await this.authService.login(
        email,
        password
      );
      res.cookie(ENV.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: Number(ENV.ACCESS_TOKEN_EXPIRY),
      });
    });
  };

  logout = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      res.clearCookie(ENV.ACCESS_TOKEN_NAME);
    });
  };

  getUser = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      return this.authService.getUser();
    });
  };

  updateUser = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, async () => {
      return this.authService.updateUser();
    });
  };
}
