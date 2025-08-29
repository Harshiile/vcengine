import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { BaseController } from "./base.controller";

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  signup = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      const { email, password, username, name } = req.body;
      return this.authService.signup(email, password, username, name);
    });
  };

  login = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      const { email, password } = req.body;
      return this.authService.login(email, password);
    });
  };

  logout = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.authService.logout();
    });
  };

  getUser = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.authService.getUser();
    });
  };

  updateUser = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.authService.updateUser();
    });
  };
}
