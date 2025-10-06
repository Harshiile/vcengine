import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { WorkspaceService } from "../services/workspace.service";
import { requestValidator } from "../middleware/requestValidator";
import { getWorkspaceSchema, workspaceCreateSchema } from "../@types/req/workspace.req";
import { authValidator } from "../middleware/authValidator";

export const wsRouter = Router();

const wsontroller = new WorkspaceController(new WorkspaceService());

wsRouter.post(
  "/",
  authValidator,
  requestValidator(workspaceCreateSchema),
  wsontroller.create
);

wsRouter.get(
  "/:userId",
  requestValidator(getWorkspaceSchema),
  wsontroller.getWorkspaces
);
