import z from "zod";
import { Stream } from "stream";
import fs from "fs";
import path, { resolve } from "path";
import { createNewVersionSchema, createWorkspaceSchema } from "../@types/requests/workspace.req";
import { getPrismaInstance } from "../db";
import { v4 } from "uuid";
import { VCError } from "../utils/error";
import { createNewVersionBody } from "../controllers/workspace.controller";
import ffmpeg from 'fluent-ffmpeg'
import { s3 } from "../config/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { BUCKETS } from "../config/buckets";
import { on } from "events";
import { VideoService } from "./video.service";

type workspaceType = z.infer<
  typeof createWorkspaceSchema.shape.body.shape.type
>;

export class WorkspaceService {
  private prisma = getPrismaInstance();

  createWorkspace = async (user: string, name: string, type: workspaceType, branchName: string, banner: string | undefined) => {
    const branchId = v4();

    // 1. Create Workspace
    const { id: workspaceId } = await this.prisma.workspace.create({
      data: {
        activeBranch: branchId,
        name,
        type,
        createdBy: user,
        banner
      },
    }).catch(err => { throw err });

    //  2. Create Branch
    await this.prisma.branch.create({
      data: {
        name: branchName,
        id: branchId,
        workspace: workspaceId,
      },
    }).catch(err => { throw err });

    return {
      branchId,
      workspaceId
    }
  };

  getWorkspaceDetails = async (workspaceId: string) => {
    const prisma = getPrismaInstance()

    const workspace = await prisma
      .workspace
      .findFirst({
        where: { id: workspaceId },
        select: {
          id: true,
          banner: true,
          activeBranch: true,
          createdAt: true,
          name: true,
          type: true,
          Branch: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              activeVersion: true,
              Versions: {
                select: {
                  id: true,
                  commitMessage: true,
                  createdAt: true
                }
              }
            }
          }
        }
      }).catch(err => { throw err })

    return { workspace }
  }

  getUsersWorkspaces = async (userId: string) => {
    const prisma = getPrismaInstance()

    const workspaces = await prisma
      .workspace
      .findMany({
        where: { createdBy: userId },
        select: {
          id: true,
          banner: true,
          createdAt: true,
          name: true,
          type: true,
        },
      })
      .catch(err => { throw new VCError(400, err.message) });
    return { workspaces }
  }


  getVersions = async (workspaceId: string) => {
    const versions = await this.prisma.versions.findMany({
      where: { Videos: { every: { Workspace: { id: workspaceId } } } }
    })

    return { versions }
  }

  async isUniqueWorkspace(workspaceName: string) {
    const prisma = getPrismaInstance();

    const user = await prisma.workspace
      .findFirst({ where: { name: workspaceName } })
      .catch((err: any) => {
        throw new Error(err.message);
      });

    return user ? true : false;
  };

  createBranch = async (workspaceId: string, createdFromVersion: string, name: string) => {
    const prisma = getPrismaInstance()

    // We have to create new version record for new created branch which is its base version

    const versionId = v4()

    const { id: branchId } = await prisma.branch.create({
      data: {
        name,
        workspace: workspaceId,
        activeVersion: versionId,
        createdFromVersion,
      }
    })

    // Then create branch
    await prisma.versions.create({
      data: {
        id: versionId,
        commitMessage: "init",
        branch: branchId,
        workspace: workspaceId,
        parentVersion: null,
      }
    })
  }



  createNewVersion = async (workspace: string, branch: string, commitMessage: string, changes: createNewVersionBody["changes"]) => {
    try {


      const downloadVideoPath = path.resolve("video-download.mp4")
      const outputFolderPath = path.join("./new-video")

      if (!fs.existsSync(outputFolderPath)) fs.mkdirSync(outputFolderPath)

      let partIndex = 1;
      let globalTimeStamp = 0;

      const downloadVideo = async (bucket: string, key: string, outputPath: string) => {
        return new Promise(async (resolve, reject) => {
          const { Body, ContentType, ContentLength } = await s3.send(
            new GetObjectCommand({
              Bucket: bucket,
              Key: key,
            })
          );

          const writeStream = fs.createWriteStream(outputPath);
          const fileBody = Body as Stream;
          fileBody.pipe(writeStream);

          writeStream.on("finish", () => {
            console.log("Download Complete !!");
            resolve(1);
          });
          writeStream.on("error", (err) => {
            console.log(err);
            reject();
          });
        });
      }


      const add_replace_Section = async (newSectionFileKey: string) => {
        // Download that new added section & name it as part_${partIndex++}
        await downloadVideo(BUCKETS.VC_AVATAR, newSectionFileKey, `parts_${partIndex++}`).catch(err => { throw err })
      }

      const coverUp = (forType: string, currentNextTimestamp: number) => {
        console.log({
          forType,
          globalTimeStamp,
          currentNextTimestamp
        });

        if (currentNextTimestamp == globalTimeStamp) return;


        return new Promise((resolve, reject) => {
          ffmpeg(downloadVideoPath)
            .setStartTime(globalTimeStamp)
            .setDuration(currentNextTimestamp - globalTimeStamp)
            .output(path.join(outputFolderPath, `part_${partIndex++}.mp4`))
            .on("end", resolve)
            .on("error", reject)
            .run()
        })
      }

      type ChangesType = createNewVersionBody["changes"][number]

      changes.sort((a: ChangesType, b: ChangesType) => {
        return a.startTimestamp - b.startTimestamp
      })

      // Get latest version
      // const prisma = getPrismaInstance()

      // const latestVersion = await prisma.versions.findFirst({
      //   where: { branch, workspace },
      //   orderBy: { createdAt: "desc" },
      //   select: { id: true },
      // }).catch(err => { throw err })



      // ------------------------------------------------------------------------
      //  Download the video
      // ------------------------------------------------------------------------
      // await downloadVideo(BUCKETS.VC_RAW_VIDEOS, `${workspace}/${latestVersion?.id}/video.mp4`, downloadVideoPath).catch(err => { throw err })

      // Mix the video based on given changes
      for (const c of changes) {
        switch (c.type) {
          // Index of parts must be in ordering
          case "ADD": {
            await coverUp("ADD", c.startTimestamp)
            c.newSection && add_replace_Section(c.newSection).catch(err => { throw err })
            console.log('Adding Done');
            break;
          }

          case "REMOVE": {
            await coverUp("REMOVE", c.startTimestamp)
            globalTimeStamp = c.endTimestamp!
            console.log('Removing Done');
            break;
          }

          case "REPLACE": {
            await coverUp("REPLACE", c.startTimestamp)
            c.newSection && add_replace_Section(c.newSection).catch(err => { throw err })
            globalTimeStamp = c.endTimestamp!
            console.log('Replacing Done');
            break;
          }
        }
      }


      // Contact the video


    } catch (error) {
      console.log(error);

    }
  }
}
