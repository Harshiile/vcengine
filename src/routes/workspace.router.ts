import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { WorkspaceService } from "../services/workspace.service";
import { requestValidator } from "../middleware/requestValidator";
import { getWorkspaceSchema, workspaceCreateSchema } from "../@types/req/workspace.req";
import { authValidator } from "../middleware/authValidator";

export const wsRouter = Router();

const wsontroller = new WorkspaceController(new WorkspaceService());

// Create Workspace
wsRouter.post(
  "/",
  authValidator,
  requestValidator(workspaceCreateSchema),
  wsontroller.create
);

// Get Workspaces of User
wsRouter.get(
  "/:userId",
  requestValidator(getWorkspaceSchema),
  wsontroller.getWorkspaces
);
