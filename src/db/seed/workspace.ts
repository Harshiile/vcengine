import { PrismaClient } from "@prisma/client";
import { WorkspaceType } from "../../../generated/prisma";

const workspaces = [
  {
    createdBy: 1,
    name: "WS One By User-1",
    type: WorkspaceType.Public,
  },
  {
    createdBy: 1,
    name: "WS Two by User-1",
    type: WorkspaceType.Private,
  },
  {
    createdBy: 2,
    name: "WS One By User-2",
    type: WorkspaceType.Public,
  },
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
