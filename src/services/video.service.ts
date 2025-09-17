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
import { sendProgress } from "../socket";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

  async generateSignedURL(fileName: string, ContentType: string) {
    const command = new PutObjectCommand({
      Bucket: BUCKETS.VC_RAW_VIDEOS,
      Key: fileName,
      ContentType,
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

  async downloadVideo() {}
  async createVersion() {}
  async getVersions() {}
  async addComment() {}
  async getComments() {}
}
