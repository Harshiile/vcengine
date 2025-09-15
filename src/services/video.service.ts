import busboy from "busboy";
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

  async uploadVideo(bb: busboy.Busboy, fileSize: number, socketId: string) {
    let workspace: string | null = null;
    let title: string | null = null;

    bb.on("field", (fieldName, val) => {
      if (fieldName == "workspace") workspace = val;
      if (fieldName == "title") title = val;
    });

    let uploadPromises: Promise<CompleteMultipartUploadCommandOutput>[] = [];

    bb.on("file", async (fieldName, fileStream, fileInfo) => {
      console.log(`Uploading: ${fileInfo.filename}`);
      const fileName = `${title}.${workspace}`; // Prevent user to use '.' in title name - so we can use here
      console.log({ fileName });

      const parallelUpload = new Upload({
        client: s3,
        params: {
          Bucket: BUCKETS.VC_RAW_VIDEOS,
          Key: fileName,
          Body: fileStream,
          ContentType: fileInfo.mimeType,
        },
      }).on("httpUploadProgress", (p) => {
        if (p.loaded) {
          const percent = p?.loaded / fileSize;
          console.log(`Uploading : ${(percent * 100).toPrecision(4)}%`);

          sendProgress(socketId, Number((percent * 100).toPrecision(4)));
        }
      });

      uploadPromises.push(parallelUpload.done());
    });

    bb.on("finish", async () => {
      try {
        await Promise.all(uploadPromises);
        return { success: true, message: "File uploaded successfully" };
      } catch (err) {
        console.error(err);
        throw err;
      }
    });
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
