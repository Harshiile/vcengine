import { Router } from "express";
import { CollaborateController } from "../controllers/collab.controller";
import { CollaborateService } from "../services/collaborate.service";

export const collabRouter = Router();

const collabController = new CollaborateController(new CollaborateService());

collabRouter.post("/fork", collabController.forkWorkspace);
collabRouter.post("/issue", collabController.createIssue);
collabRouter.get("/issues", collabController.getIssues);
collabRouter.post("/permission", collabController.openPullRequest);
collabRouter.get("/permissions", collabController.getPullRequets);
