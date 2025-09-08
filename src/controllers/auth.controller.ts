import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { BaseController } from "./base.controller";
import { prisma } from "../db";

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  signup = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { email, password, username, name } = req.body;
      const { accessToken } = await this.authService.signup(
        email,
        password,
        username,
        name
      );
      res.cookie("auth-acs", accessToken);
    });
  };

  login = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { email, password } = req.body;
      const { user, accessToken } = await this.authService.login(
        email,
        password
      );
      res.cookie("auth-acs", accessToken);
    });
  };

  logout = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      res.clearCookie("auth-acs");
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
