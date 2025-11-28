import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { WorkspaceService } from "../services/workspace.service";
import z from "zod";
import { getWorkspaceOfUserSchema, createWorkspaceSchema, getVersionsSchema, createBranchSchema, isWorkspaceUniqueSchema, createNewVersionSchema, getBranchSchema, getWorkspaceDetailsSchema } from "../@types/requests/workspace.req";

type wsCreateBody = z.infer<typeof createWorkspaceSchema.shape.body>;
type wsOfUserGetParams = z.infer<typeof getWorkspaceOfUserSchema.shape.params>;
type workspaceByParams = z.infer<typeof getWorkspaceDetailsSchema.shape.params>;
type versionGetParams = z.infer<typeof getVersionsSchema.shape.params>;
type createBranchBody = z.infer<typeof createBranchSchema.shape.body>;
type isWorkspaceUniqueParams = z.infer<typeof isWorkspaceUniqueSchema.shape.params>;
type getBranchParams = z.infer<typeof getBranchSchema.shape.params>;
export type createNewVersionBody = z.infer<typeof createNewVersionSchema.shape.body>;

export class WorkspaceController extends BaseController {
  constructor(private workspaceService: WorkspaceService) {
    super();
  }

  createWorkspace = (
    req: Request<{}, {}, wsCreateBody>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { name, type, branchName, banner } = req.body
      const { branchId, workspaceId } = await this.workspaceService.createWorkspace(req.user, name, type, branchName, banner)

      return {
        branchId,
        workspaceId
      }
    });
  };

  getWorkspaceDetails = (req: Request<workspaceByParams>,
    res: Response,
    next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { workspace } = await this.workspaceService.getWorkspaceDetails(req.params.workspaceId);
      return { workspace }
    });
  }


  getUsersWorkspaces = (
    req: Request<wsOfUserGetParams>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { workspaces } = await this.workspaceService.getUsersWorkspaces(req.params.userId);
      return { workspaces }
    });
  };

  getVersions = (
    req: Request<versionGetParams>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { versions } = await this.workspaceService.getVersions(req.params.branchId);
      return { versions }
    });
  };

  createBranch = (
    req: Request<{}, {}, createBranchBody>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { createdFromVersion, name, workspaceId } = req.body
      await this.workspaceService.createBranch(workspaceId, createdFromVersion, name)
      return { message: "Branch Created !!" }
    });
  };

  getBranch = (
    req: Request<getBranchParams>,
    res: Response,
    next: NextFunction
  ): void => {
    this.baseRequest(req, res, next, async () => {
      const { workspaceId } = req.params
      const { branches } = await this.workspaceService.getBranch(workspaceId)
      return { branches }
    });
  };

  // Check whether given workspace is unique or not
  isUniqueWorkspace = (req: Request<isWorkspaceUniqueParams>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      return (await this.workspaceService.isUniqueWorkspace(req.params.workspaceName))
    });
  };


  // Add new version
  createNewVersion = (req: Request<{}, {}, createNewVersionBody>, res: Response, next: NextFunction): void => {
    this.baseRequest(req, res, next, async () => {
      const { commitMessage, changes, oldVersion } = req.body
      const message = await this.workspaceService.createNewVersion(oldVersion, commitMessage, changes)
      return {
        message
      }
    });
  }
}
