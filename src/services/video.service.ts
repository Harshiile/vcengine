import { s3 } from "../config/s3";
import {
  CompleteMultipartUploadCommandOutput,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Stream } from "stream";
import { BUCKETS } from "../config/buckets";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrlBody } from "../controllers/video.controller";
import { getPrismaInstance } from "../db";
import { v4 } from "uuid";
// POST   /video/upload-on/{provider}/{id}   —   Upload on third-party streaming platform

export class VideoService {
  private prisma = getPrismaInstance();
  private async getStream(fileKey: string, bucketName: string) {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      })
    );
    return Body;
  }

  async uploadVideo(
    contentType: string,
    branch: string,
    workspace: string,
    commitMessage: string,
    user: string
  ) {
    // Create version record
    // const { id } = await this.prisma.versions.create({
    //   data: {
    //     branch,
    //     commitMessage,
    //     parentVersion: null,
    //   },
    // });

    const videoId = v4();
    const fileKey = `${user}/${workspace}/${videoId}.${contentType.split("/")[1]}`;
    const command = new PutObjectCommand({
      Bucket: BUCKETS.VC_RAW_VIDEOS,
      Key: fileKey,
      ContentType: contentType,
    });


    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return { uploadUrl, fileKey };
  }

  async signedUrl(
    user: string,
    { type, workspace, contentType }: getSignedUrlBody
  ) {
    const command = new PutObjectCommand({
      Bucket: type == "banner" ? BUCKETS.VC_BANNER : BUCKETS.VC_RAW_VIDEOS,
      Key: type == "banner" ? user : `${user}/${workspace}`,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return { uploadUrl };
  }

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

  async downloadVideo() { }
  async createVersion() { }
  async getVersions() { }
  async addComment() { }
  async getComments() { }
}
