import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { WorkspaceService } from "../services/workspace.service";

export const workspaceRouter = Router();

const workspaceController = new WorkspaceController(new WorkspaceService());

workspaceRouter.post("/workspace", workspaceController.createWorkspace);
workspaceRouter.get("/workspace", workspaceController.getWorkspace);
workspaceRouter.put("/workspace", workspaceController.updateWorkspace);
workspaceRouter.delete("/workspace", workspaceController.deleteWorkspace);
workspaceRouter.post("/permission", workspaceController.addPermission);
workspaceRouter.get("/permissions", workspaceController.getPermissions);
