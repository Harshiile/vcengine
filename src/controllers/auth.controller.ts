import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { BaseController } from "./base.controller";
import { ENV } from "../config/env";
import z from "zod";
import { signupSchema } from "../@types/req";
import { getAvatarSchema, uploadAvatarSchema } from "../@types/req/auth.req";

type signupBody = z.infer<typeof signupSchema.shape.body>;
type uploadAvatarBody = z.infer<typeof uploadAvatarSchema.shape.body>;
type getAvatarBody = z.infer<typeof getAvatarSchema.shape.params>;

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

      const { accessToken } = await this.authService.signup(
        email,
        password,
        username,
        name,
        avatar
      );

      res.cookie(ENV.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: Number(ENV.ACCESS_TOKEN_EXPIRY),
      });

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


  uploadAvatar = (req: Request<{}, {}, uploadAvatarBody>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { uploadUrl, avatarKey } = await this.authService.uploadAvatar(req.body.contentType)
      return { uploadUrl, avatarKey }
    })
  }

  getAvatar = async (req: Request<getAvatarBody>, res: Response, next: NextFunction) => {
    try {
      const avatarStream = await this.authService.getAvatar(req.params.userId);

      if (!avatarStream) return null;

      res.setHeader("Cache-Control", "public, max-age=86400, immutable"); // Caching for 1 day
      avatarStream.pipe(res);

      const { uploadUrl, avatarKey } = await this.authService.uploadAvatar(req.body.contentType)
      return { uploadUrl, avatarKey }
    }
    catch (err) { }
  }


  getUser = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      return this.authService.getUser(req.user);
    });
  };

  updateUser = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, async () => {
      return this.authService.updateUser();
    });
  };
}
