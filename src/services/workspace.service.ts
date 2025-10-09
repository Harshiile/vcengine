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

  createWorkspace = async (user: string, name: string, type: workspaceType, branchName: string, banner: string) => {
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
    });

    //  2. Create Branch
    await this.prisma.branch.create({
      data: {
        name: branchName,
        createdBy: user,
        id: branchId,
        workspace: workspaceId,
      },
    });

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
}
