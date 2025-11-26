import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { WorkspaceService } from "../services/workspace.service";
import { requestValidator } from "../middleware/requestValidator";
import { getWorkspaceOfUserSchema, createWorkspaceSchema, getVersionsSchema, createBranchSchema, isWorkspaceUniqueSchema, getWorkspaceDetailsSchema, createNewVersionSchema, getBranchSchema } from "../@types/requests/workspace.req";
import { authValidator } from "../middleware/authValidator";

export const wsRouter = Router();

const wsontroller = new WorkspaceController(new WorkspaceService());

// Create Workspace
wsRouter.post(
  "/",
  requestValidator(createWorkspaceSchema),
  wsontroller.createWorkspace
);

// Get Workspaces of User
wsRouter.get(
  "/users/:userId",
  requestValidator(getWorkspaceOfUserSchema),
  wsontroller.getUsersWorkspaces
);

// Get Workspace Details by ID
wsRouter.get(
  "/:workspaceId",
  requestValidator(getWorkspaceDetailsSchema),
  wsontroller.getWorkspaceDetails
);

// Get Versions of Workspaces
wsRouter.get(
  "/:branchId/versions",
  requestValidator(getVersionsSchema),
  wsontroller.getVersions
);

// Create Branch
wsRouter.post(
  "/branches",
  requestValidator(createBranchSchema),
  wsontroller.createBranch
);

// Get Branch
wsRouter.get(
  "/:workspaceId/branches",
  requestValidator(getBranchSchema),
  wsontroller.getBranch
);

// Create Branch
wsRouter.get(
  "/uniqueness/:workspaceName",
  requestValidator(isWorkspaceUniqueSchema),
  wsontroller.isUniqueWorkspace
);

// Create New Version
wsRouter.post(
  "/versions/new",
  requestValidator(createNewVersionSchema),
  wsontroller.createNewVersion
);
