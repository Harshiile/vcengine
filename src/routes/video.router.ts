import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { VideoService } from "../services/video.service";
import { requestValidator } from "../middleware/requestValidator";
import {
  generateSignedURLSchema,
  getMaxResolutionSchema,
  getPlaylistSchema,
  getSegmentSchema,
} from "../@types/req/video.req";

export const videoRouter = Router();

const videoController = new VideoController(new VideoService());

videoRouter.post(
  "/get-signed-url/:type",
  requestValidator(generateSignedURLSchema),
  videoController.generateSignedURL
);
videoRouter.get(
  "/playlist/:workspace/:version/:resolution",
  requestValidator(getPlaylistSchema),
  videoController.getPlaylist
);
videoRouter.get(
  "/segments/:segmentHash",
  requestValidator(getSegmentSchema),
  videoController.getSegment
);
videoRouter.get(
  "/max-resolution/:workspace",
  requestValidator(getMaxResolutionSchema),
  videoController.getmaxResolution
);
videoRouter.get("/download", videoController.downloadVideo);
videoRouter.post("/version", videoController.createVersion);
videoRouter.get("/versions", videoController.getVersions);
videoRouter.post("/comment", videoController.addComment);
videoRouter.get("/comments", videoController.getComments);
