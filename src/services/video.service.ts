import busboy from "busboy";
import { drive_v2, google } from "googleapis";
import { ENV } from "../config/env";
import { spawn } from "child_process";
import { Stream } from "stream";

// POST   /video/upload-on/{provider}/{id}   —   Upload on third-party streaming platform

export class VideoService {
  private async driveUpload(
    drive: drive_v2.Drive,
    fileInfo: busboy.FileInfo,
    fileSize: number,
    Stream: Stream.Readable
  ) {
    return drive.files
      .insert(
        {
          requestBody: {
            title: fileInfo.filename,
            parents: [{ id: ENV.DRIVE_VIDEO_FOLDER_ID }],
          },
          media: {
            mimeType: fileInfo.mimeType,
            body: Stream,
          },
          fields: "id",
        },
        {
          onUploadProgress(progress) {
            const { bytesRead } = progress;
            console.log(
              `Uploading - ${
                100 * Number((bytesRead / fileSize).toPrecision(2))
              } %`
            );
          },
        }
      )
      .then(({ data }) => {
        return data.id;
      })
      .catch((err) => {
        throw new Error();
      });
  }

  async uploadVideo(bb: busboy.Busboy, fileSize: string) {
    return new Promise((resolve, reject) => {
      // const chunkSizeInSeconds = 15;
      const authClient = new google.auth.GoogleAuth({
        credentials: JSON.parse(ENV.DRIVE_SERVICE_ACCOUNT_CREDENTIALS),
        scopes: ["https://www.googleapis.com/auth/drive"],
      });

      const drive = google.drive({ version: "v2", auth: authClient });
      let fileId: string | null = null;

      bb.on("file", async (fieldName, Stream, fileInfo) => {
        // const ffmpeg = spawn("ffmpeg", [
        //   "-i",
        //   "-c",
        //   "copy",
        //   "-map",
        //   "0",
        //   "-segment_time",
        //   "30",
        //   "-f",
        //   "segment",
        //   "-reset_timestamps",
        //   "1",
        //   "chunk%02d.mp4",
        // ]);
      });

      bb.on("finish", () => console.log("Uploading Finish"));
    });
  }
  async streamVideo() {}
  async downloadVideo() {}
  async createVersion() {}
  async getVersions() {}
  async addComment() {}
  async getComments() {}
}
