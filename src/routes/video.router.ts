import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { VideoService } from "../services/video.service";
import { requestValidator } from "../middleware/requestValidator";
import {
  uploadVideoSchema,
  getMaxResolutionSchema,
  getPlaylistSchema,
  getSegmentSchema,
} from "../@types/requests/video.req";

export const videoRouter = Router();

const videoController = new VideoController(new VideoService());

// Video Upload
videoRouter.post(
  "/upload",
  requestValidator(uploadVideoSchema),
  videoController.uploadVideo
);

// Get Playlist File
videoRouter.get(
  "/:versionId/playlist/:resolution",
  requestValidator(getPlaylistSchema),
  videoController.getPlaylist
);

// Get Segments
videoRouter.get(
  "/segments/:segmentHash",
  requestValidator(getSegmentSchema),
  videoController.getSegments
);

// Get Max Resolution of Workspace
videoRouter.get(
  "/:workspaceId/max-resolution",
  requestValidator(getMaxResolutionSchema),
  videoController.getmaxResolution
);