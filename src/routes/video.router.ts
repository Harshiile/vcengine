import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { VideoService } from "../services/video.service";

export const videoRouter = Router();

const videoController = new VideoController(new VideoService());

videoRouter.post("/upload", videoController.uploadVideo);
videoRouter.get("/stream", videoController.streamVideo);
videoRouter.get("/download", videoController.downloadVideo);
videoRouter.post("/version", videoController.createVersion);
videoRouter.get("/versions", videoController.getVersions);
videoRouter.post("/comment", videoController.addComment);
videoRouter.get("/comments", videoController.getComments);
