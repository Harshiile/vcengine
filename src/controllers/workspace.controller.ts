import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { WorkspaceService } from "../services/workspace.service";
import z from "zod";
import { workspaceCreateSchema } from "../@types/req/workspace.req";

type wsCreateBody = z.infer<typeof workspaceCreateSchema.shape.body>;

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
      const { name, type } = req.body;
      const { user } = req;
      return this.workspaceService.createWorkspace(user, name, type);
    });
  };
}
