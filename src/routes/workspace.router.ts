import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { WorkspaceService } from "../services/workspace.service";
import { requestValidator } from "../middleware/requestValidator";
import { getWorkspaceSchema, createWorkspaceSchema, getVersionsSchema, createBranchSchema, isWorkspaceUniqueSchema } from "../@types/requests/workspace.req";
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
  requestValidator(getWorkspaceSchema),
  wsontroller.getWorkspaces
);

// Get Versions of Workspaces
wsRouter.get(
  "/:workspaceId/versions",
  requestValidator(getVersionsSchema),
  wsontroller.getVersions
);

// Create Branch
wsRouter.post(
  "/branches",
  requestValidator(createBranchSchema),
  wsontroller.createBranch
);

// Create Branch
wsRouter.get(
  "/uniqueness/:workspaceName",
  requestValidator(isWorkspaceUniqueSchema),
  wsontroller.isUniqueWorkspace
);
