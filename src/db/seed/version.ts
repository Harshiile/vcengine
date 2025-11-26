import { PrismaClient } from "@prisma/client";
import { ID } from "./ids";

const versions = [
    {
        id: ID.version_1,
        branch: ID.branch,
        workspace: ID.workspace,
        commitMessage: "init",
        parentVersion: null
    },
    {
        id: ID.version_2,
        branch: ID.branch,
        workspace: ID.workspace,
        commitMessage: "changes",
        parentVersion: null
    }
];

export const seedVersions = async (prisma: PrismaClient) => {
    prisma.versions
        .deleteMany()
        .then((_: any) => {
            prisma.versions
                .createMany({
                    data: versions,
                })
                .then((_: any) => console.log(`Versions seeded sucessfully`))
                .catch((err: any) => {
                    throw new Error(err);
                });
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};
