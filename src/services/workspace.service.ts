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
import { newVersionCreationQueue } from "../redis/queue";

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
    await newVersionCreationQueue.add("version_creation", {
      workspace,
      branch,
      commitMessage,
      changes
    });
  }
}
