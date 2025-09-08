import busboy from "busboy";
import { drive_v2, google } from "googleapis";
import { ENV } from "../config/env";
import ffmpeg from "fluent-ffmpeg";
import { Readable, Stream } from "stream";
import { prisma } from "../db";
import path from "path";
import { spawn } from "child_process";

// POST   /video/upload-on/{provider}/{id}   —   Upload on third-party streaming platform

export class VideoService {
  private async driveUpload(
    drive: drive_v2.Drive,
    fileName: string,
    mimeType: string,
    Stream: Stream.Readable
  ) {
    return drive.files
      .insert(
        {
          requestBody: {
            title: fileName,
            parents: [{ id: ENV.DRIVE_VIDEO_FOLDER_ID }],
          },
          media: {
            mimeType,
            body: Stream,
          },
          fields: "id",
        },
        {
          onUploadProgress(progress) {
            const { bytesRead } = progress;
            // console.log(
            //   `Uploading - ${
            //     100 * Number((bytesRead / fileSize).toPrecision(2))
            //   } %`
            // );
          },
        }
      )
      .then(({ data }) => {
        return data.id;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }

  async uploadVideo(bb: busboy.Busboy, fileSize: string) {
    return new Promise((resolve, reject) => {
      const authClient = new google.auth.GoogleAuth({
        credentials: JSON.parse(ENV.DRIVE_SERVICE_ACCOUNT_CREDENTIALS),
        scopes: ["https://www.googleapis.com/auth/drive"],
      });

      const drive = google.drive({ version: "v2", auth: authClient });

      bb.on("file", async (fieldName, Stream, fileInfo) => {});

      bb.on("finish", () => {
        console.log("Uploading Stream Finish");
      });
    });
  }
  async streamVideo() {}
  async downloadVideo() {}
  async createVersion() {}
  async getVersions() {}
  async addComment() {}
  async getComments() {}
}
