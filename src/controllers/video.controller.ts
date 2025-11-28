import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { VideoService } from "../services/video.service";
import fs from "fs";
import path from "path";
import { BUCKETS } from "../config/buckets";
import z from "zod";
import { downloadVideoSchema, getMaxResolutionSchema, getPlaylistSchema, uploadVideoSchema, videoStateSchema } from "../@types/requests/video.req";
import { spawn } from "child_process";
import Stream from "stream";
import { VCError } from "../utils/error";

type uploadVideoBody = z.infer<typeof uploadVideoSchema.shape.body>;
type downloadVideoParams = z.infer<typeof downloadVideoSchema.shape.params>;
type getPlaylistParams = z.infer<typeof getPlaylistSchema.shape.params>;
type getMaxResolutionParams = z.infer<typeof getMaxResolutionSchema.shape.params>;
type getVideoStateParams = z.infer<typeof videoStateSchema.shape.params>;

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


  getPlaylist = async (req: Request<getPlaylistParams>, res: Response, next: NextFunction) => {
    try {
      const { resolution, versionId } = req.params;
      // const fileName = `${workspace}/${version}/playlist_${resolution}.m3u8`;
      const fileName = `${versionId}/playlist_${resolution}.m3u8`;

      const playlistStream = await this.videoService.getPlaylist<Stream>(fileName);

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

  getmaxResolution = (req: Request<getMaxResolutionParams>, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, async () => {
      const { versionId } = req.params;
      const maxResolution = await this.videoService.getmaxResolution(versionId);
      return { maxResolution };
    });
  };

  getVideoState = (req: Request<getVideoStateParams>, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, async () => {
      const { versionId, resolution } = req.params;

      const state = await this.videoService.getVideoState(versionId, Number(resolution));
      if (!state) throw new VCError(400, "State is not suitable")

      return { state }
    });
  };

  downloadVideo = async (req: Request<downloadVideoParams>, res: Response, next: NextFunction) => {
    try {
      const { versionId, workspaceId } = req.params
      const videoStream = await this.videoService.downloadVideo(workspaceId, versionId);

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="${versionId}.mp4"`);
      videoStream.pipe(res)
    } catch (error) {
      throw error
    }
  };
}
