import { PrismaClient } from "@prisma/client";
import { WorkspaceType } from "../../../generated/prisma";
import { ID } from "./ids";

const workspaces = [
  {
    id: ID.workspace,
    createBy: ID.user,
    name: "FirstOne",
    type: WorkspaceType.Private,
    banner: "9dab4f27-db04-443e-bf4e-155552e69d91.jpeg",
    activeBranch: ID.branch,
  }
];

export const seedWorkspace = async (prisma: PrismaClient) => {
  prisma.workspace
    .deleteMany()
    .then((_: any) => {
      prisma.workspace
        .createMany({
          data: workspaces,
        })
        .then((_: any) => console.log(`Workspaces seeded sucessfully`))
        .catch((err: any) => {
          throw new Error(err);
        });
    })
    .catch((err: any) => {
      throw new Error(err);
    });
};
