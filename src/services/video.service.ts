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
import { getPrismaInstance } from "../db";
import { v4 } from "uuid";
import { VCError } from "../utils/error";
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
    /*
      Flow
        1. Create Version
        2. Send Signed URL
        3. Add videos records in image
    */

    // 1. Create version record
    const versionId = v4()
    await this.prisma.versions.create({
      data: {
        id: versionId,
        branch,
        commitMessage,
        parentVersion: null,
      },
    }).catch(err => { throw new VCError(400, err.message) });


    // 2. Send Signed URL
    const videoId = v4();
    const fileKey = `${user}/${workspace}/${versionId}/${videoId}.${contentType.split("/")[1]}`;

    const command = new PutObjectCommand({
      Bucket: BUCKETS.VC_RAW_VIDEOS,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return { uploadUrl, fileKey };
  }


  async getPlaylist(fileKey: string) {
    return (await this.getStream(fileKey, BUCKETS.VC_PLAYLIST)) as Stream;
  }

  async getSegment(segmentKey: string) {
    return (await this.getStream(segmentKey, BUCKETS.VC_SEGMENTS)) as Stream;
  }

  async getmaxResolution(workspace: string) {

    const prisma = getPrismaInstance()

    const resolutions = await prisma.videos.findMany({
      where: { Workspace: { id: workspace } },
      select: { height: true }
    }).catch(err => { throw new VCError(400, err.message) })

    let maxResolution = 0;
    console.log(resolutions);

    resolutions.map(({ height }) => {
      // console.log(height);

      maxResolution = Math.max(maxResolution, Number(height));
    });

    return maxResolution;
  }

  async downloadVideo() { }
  async createVersion() { }
  async getVersions() { }
  async addComment() { }
  async getComments() { }
}
