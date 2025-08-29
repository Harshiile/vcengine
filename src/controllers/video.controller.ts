import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { VideoService } from "../services/video.service";

export class VideoController extends BaseController {
  constructor(private videoService: VideoService) {
    super();
  }

  uploadVideo = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.videoService.uploadVideo();
    });
  };

  streamVideo = (req: Request, res: Response, next: NextFunction) => {
    this.baseRequest(req, res, next, () => {
      return this.videoService.streamVideo();
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
