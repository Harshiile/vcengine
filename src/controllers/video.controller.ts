import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { VideoService } from "../services/video.service";
import fs from "fs";
import path from "path";
import { BUCKETS } from "../config/buckets";
import z from "zod";
import { uploadVideoSchema } from "../@types/req/video.req";

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

      const user = '21841b57-87b4-410d-8c48-aa4d95582772' // should be req.user
      return await this.videoService.uploadVideo(
        contentType,
        branch,
        workspace,
        commitMessage,
        user
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

  getSegment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { segmentHash } = req.params;

      const segmentStream = await this.videoService.getSegment(segmentHash);

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

  addComment = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.videoService.addComment();
    });
  };

  getComments = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.videoService.getComments();
    });
  };

  createVersion = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.videoService.createVersion();
    });
  };

  getVersions = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.videoService.getVersions();
    });
  };
}
