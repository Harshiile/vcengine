import z from "zod";
import { workspaceCreateSchema } from "../@types/req/workspace.req";
import { getPrismaInstance } from "../db";
import { v4 } from "uuid";

type workspaceType = z.infer<
  typeof workspaceCreateSchema.shape.body.shape.type
>;

export class WorkspaceService {
  private prisma = getPrismaInstance();

  createWorkspace = async (user: string, name: string, type: workspaceType) => {
    const branchId = v4();
    const { id: workspaceId } = await this.prisma.workspace.create({
      data: {
        activeBranch: branchId,
        name,
        type,
        createdBy: user,
      },
    });

    await this.prisma.branch.create({
      data: {
        name: "main",
        createdBy: user,
        id: branchId,
        workspace: workspaceId,
      },
    });
  };
}
