import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { VideoService } from "../services/video.service";
import fs from "fs";
import path from "path";
import { BUCKETS } from "../config/buckets";
import z from "zod";
import { uploadVideoSchema } from "../@types/requests/video.req";

type uploadVideoBody = z.infer<typeof uploadVideoSchema.shape.body>;

export class VideoController extends BaseController {
  constructor(private videoService: VideoService) {
    super();
  }

  uploadVideo = (
    req: Request<{}, {}, uploadVideoBody>,
    res: Response,
    next: NextFunction
  ) => {
    this.baseRequest(req, res, next, async () => {
      const { contentType, commitMessage, workspace, branch } = req.body;

      return await this.videoService.uploadVideo(
        contentType,
        branch,
        workspace,
        commitMessage,
        req.user
      );
    });
  };


  getPlaylist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resolution, version, workspace } = req.params;
      // const fileName = `${workspace}/${version}/playlist_${resolution}.m3u8`;
      const fileName = `${workspace}/playlist_${resolution}.m3u8`;

      const playlistStream = await this.videoService.getPlaylist(fileName);

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "public, max-age=86400, immutable"); // Caching for 1 day
      playlistStream.pipe(res);
    } catch (error) {
      throw error;
    }
  };

  getSegments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { segmentHash } = req.params;

      const segmentStream = await this.videoService.getSegments(segmentHash);

      res.setHeader("Content-Type", "video/MP2T");
      res.setHeader("Cache-Control", "public, max-age=86400, immutable"); // Caching for 1 day
      segmentStream.pipe(res);
    } catch (error) {
      throw error;
    }
  };

  getmaxResolution = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, async () => {
      const { workspace } = req.params;

      const maxResolution = await this.videoService.getmaxResolution(workspace);
      return { maxResolution };
    });
  };

  downloadVideo = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.videoService.downloadVideo();
    });
  };
}
