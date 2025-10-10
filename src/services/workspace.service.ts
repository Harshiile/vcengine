import z from "zod";
import { createWorkspaceSchema } from "../@types/requests/workspace.req";
import { getPrismaInstance } from "../db";
import { v4 } from "uuid";
import { VCError } from "../utils/error";

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


  getWorkspaces = async (userId: string) => {
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
          Branch: {
            select: { id: true, name: true }
          }
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
}
