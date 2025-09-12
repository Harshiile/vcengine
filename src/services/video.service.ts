import busboy from "busboy";
import { drive_v2, google } from "googleapis";
import { ENV } from "../config/env";
import ffmpeg from "fluent-ffmpeg";
import { Readable, Stream } from "stream";
import { prisma } from "../db";
import path from "path";
import { spawn } from "child_process";
import { s3 } from "../config/s3";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { BUCKETS } from "../config/buckets";

// POST   /video/upload-on/{provider}/{id}   —   Upload on third-party streaming platform

export class VideoService {
  private async getStream(fileKey: string, bucketName: string) {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      })
    );
    return Body;
  }
  async uploadVideo(bb: busboy.Busboy, fileSize: string) {}

  async getPlaylist(fileKey: string) {
    return (await this.getStream(fileKey, BUCKETS.VC_PLAYLIST)) as Stream;
  }

  async getSegment(segmentKey: string) {
    return (await this.getStream(segmentKey, BUCKETS.VC_SEGMENTS)) as Stream;
  }

  async getmaxResolution(workspace: string) {
    const { Contents } = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKETS.VC_PLAYLIST,
        Prefix: workspace,
      })
    );
    let maxResolution = 0;
    Contents?.map((file) => {
      const playlistName = file.Key?.split("/")[1];
      const resolution = playlistName?.split("_")[1]?.split(".")[0];
      maxResolution = Math.max(maxResolution, Number(resolution));
    });
    return maxResolution;
  }

  async downloadVideo() {}
  async createVersion() {}
  async getVersions() {}
  async addComment() {}
  async getComments() {}
}
