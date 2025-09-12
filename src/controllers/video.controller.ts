import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { VideoService } from "../services/video.service";
import busboy from "busboy";
import { BUCKETS } from "../config/buckets";

export class VideoController extends BaseController {
  constructor(private videoService: VideoService) {
    super();
  }

  uploadVideo = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      const bb = busboy({ headers: req.headers });
      const fileSize = req.headers["content-length"];
      req.pipe(bb);
      return this.videoService.uploadVideo(bb, fileSize!);
    });
  };

  getPlaylist = async (req: Request, res: Response, next: NextFunction) => {
    const { resolution, version, workspace } = req.params;
    // const fileName = `${workspace}/${version}/playlist_${resolution}.m3u8`;
    const fileName = `${workspace}/playlist_${resolution}.m3u8`;
    console.log(fileName);

    const playlistStream = await this.videoService.getPlaylist(fileName);

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable"); // Caching for 1 day
    playlistStream.pipe(res);
  };

  getSegment = async (req: Request, res: Response, next: NextFunction) => {
    const { segmentHash } = req.params;

    const segmentStream = await this.videoService.getSegment(segmentHash);

    res.setHeader("Content-Type", "video/MP2T");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable"); // Caching for 1 day
    segmentStream.pipe(res);
  };

  getmaxResolution = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { workspace } = req.params;
    const maxResolution = await this.videoService.getmaxResolution(workspace);
    res.json({ maxResolution });
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
