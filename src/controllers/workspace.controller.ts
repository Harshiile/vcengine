import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { WorkspaceService } from "../services/workspace.service";
import z from "zod";
import { getWorkspaceSchema, createWorkspaceSchema } from "../@types/requests/workspace.req";

type wsCreateBody = z.infer<typeof createWorkspaceSchema.shape.body>;
type wsGetParams = z.infer<typeof getWorkspaceSchema.shape.params>;

export class WorkspaceController extends BaseController {
  constructor(private workspaceService: WorkspaceService) {
    super();
  }

  create = (
    req: Request<{}, {}, wsCreateBody>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { name, type } = req.body
      this.workspaceService.createWorkspace(req.user, name, type)
    });
  };

  getWorkspaces = (
    req: Request<wsGetParams>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { workspaces } = await this.workspaceService.getWorkspaces(req.params.userId);
      return { workspaces }
    });
  };
}
