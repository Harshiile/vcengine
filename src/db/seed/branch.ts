import { PrismaClient } from "@prisma/client";
import { ID } from "./ids";

const branches = [
    {
        id: ID.branch,
        name: "master",
        workspace: ID.workspace,
        createdFromVersion: null,
        activeVersion: ID.version_1
    }
];

export const seedBranch = async (prisma: PrismaClient) => {
    prisma.branch
        .deleteMany()
        .then((_: any) => {
            prisma.branch
                .createMany({
                    data: branches,
                })
                .then((_: any) => console.log(`Branch seeded sucessfully`))
                .catch((err: any) => {
                    throw new Error(err);
                });
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};
