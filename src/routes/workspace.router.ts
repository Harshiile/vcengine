import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { WorkspaceService } from "../services/workspace.service";
import { requestValidator } from "../middleware/requestValidator";
import { getWorkspaceSchema, createWorkspaceSchema, getVersionsSchema } from "../@types/requests/workspace.req";
import { authValidator } from "../middleware/authValidator";

export const wsRouter = Router();

const wsontroller = new WorkspaceController(new WorkspaceService());

// Create Workspace
wsRouter.post(
  "/",
  authValidator,
  requestValidator(createWorkspaceSchema),
  wsontroller.create
);

// Get Workspaces of User
wsRouter.get(
  "/:userId",
  authValidator,
  requestValidator(getWorkspaceSchema),
  wsontroller.getWorkspaces
);

// Get Versions of Workspaces
wsRouter.get(
  "/versions/:workspaceId",
  authValidator,
  requestValidator(getVersionsSchema),
  wsontroller.getVersions
);
