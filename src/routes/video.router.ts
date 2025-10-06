import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { VideoService } from "../services/video.service";
import { requestValidator } from "../middleware/requestValidator";
import {
  uploadVideoSchema,
  getMaxResolutionSchema,
  getPlaylistSchema,
  getSegmentSchema,
} from "../@types/req/video.req";
import { getSignedUrlSchema } from "../@types/req";

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
  "/playlist/:workspace/:version/:resolution",
  requestValidator(getPlaylistSchema),
  videoController.getPlaylist
);

// Get Segments
videoRouter.get(
  "/segments/:segmentHash",
  requestValidator(getSegmentSchema),
  videoController.getSegment
);

// Get Max Resolution of Workspace
videoRouter.get(
  "/max-resolution/:workspace",
  requestValidator(getMaxResolutionSchema),
  videoController.getmaxResolution
);