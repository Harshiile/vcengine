import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { CollaborateService } from "../services/collaborate.service";

export class CollaborateController extends BaseController {
  constructor(private collaborateService: CollaborateService) {
    super();
  }

  forkWorkspace = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.collaborateService.forkWorkspace("1");
    });
  };

  createIssue = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.collaborateService.createIssue("1");
    });
  };

  getIssues = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.collaborateService.getIssues("1");
    });
  };

  openPullRequest = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.collaborateService.openPullRequest("1");
    });
  };

  getPullRequets = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.collaborateService.getPullRequests("1");
    });
  };
}
