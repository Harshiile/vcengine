import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { WorkspaceService } from "../services/workspace.service";

export class WorkspaceController extends BaseController {
  constructor(private workspaceService: WorkspaceService) {
    super();
  }

  id: string = "1001";

  createWorkspace = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.createWorkspace();
    });
  };

  getWorkspace = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.getWorkspace(this.id);
    });
  };

  updateWorkspace = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.updateWorkspace(this.id);
    });
  };

  deleteWorkspace = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.deleteWorkspace(this.id);
    });
  };

  addPermission = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.addPermission();
    });
  };

  getPermissions = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.getPermissions(this.id);
    });
  };

  addBranch = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.createBranch(this.id);
    });
  };

  getBranches = (req: Request, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, () => {
      return this.workspaceService.getBranches(this.id);
    });
  };
}
