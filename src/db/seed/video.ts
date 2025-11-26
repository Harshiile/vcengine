import { PrismaClient } from "@prisma/client";
import { ID } from "./ids";

export const seedVideos = async (prisma: PrismaClient) => {
    prisma.videos
        .deleteMany()
        .then((_: any) => {
            prisma.videos
                .createMany({
                    data: videos,
                })
                .then((_: any) => console.log(`Videos seeded sucessfully`))
                .catch((err: any) => {
                    throw new Error(err);
                });
        })
        .catch((err: any) => {
            throw new Error(err);
        });
};

const videos = [
    {
        id: "4e9868f0-2024-4690-99cf-0a83df7c90ee",
        workspace: ID.workspace,
        width: 1920,
        height: 1080,
        version: ID.version_1,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "9aacb0b4-90ad-4e10-ac4f-ccd45db2fb28",
        workspace: ID.workspace,
        width: 256,
        height: 144,
        version: ID.version_1,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "3d5e1c7d-562a-49ef-aa7a-a9c97b6ef9b7",
        workspace: ID.workspace,
        width: 256,
        height: 144,
        version: ID.version_2,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "dc354999-70bb-4c45-bc34-6d454692c187",
        workspace: ID.workspace,
        width: 426,
        height: 240,
        version: ID.version_1,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "87ab9d46-a002-4fa4-91b6-3e647e906df5",
        workspace: ID.workspace,
        width: 426,
        height: 240,
        version: ID.version_2,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "98d0747f-2e07-406b-9445-f38757a40d8c",
        workspace: ID.workspace,
        width: 640,
        height: 360,
        version: ID.version_1,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "502ac62d-f5a3-4aae-88aa-62e1fe4b8b6a",
        workspace: ID.workspace,
        width: 640,
        height: 360,
        version: ID.version_2,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "b6cb5f63-faf7-496d-add7-44e4dcb00a3a",
        workspace: ID.workspace,
        width: 854,
        height: 480,
        version: ID.version_1,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "6530296f-55e8-435d-924e-b9f07ce2d170",
        workspace: ID.workspace,
        width: 854,
        height: 480,
        version: ID.version_2,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "6af9af7d-71db-4550-b3fc-8518ce18b616",
        workspace: ID.workspace,
        width: 1280,
        height: 720,
        version: ID.version_1,
        state: "Uploaded",
        contentType: "mp4",
    },
    {
        id: "e3776d48-7e67-4500-babd-0aeb1b24ad8bd",
        workspace: ID.workspace,
        width: 1280,
        height: 720,
        version: ID.version_2,
        state: "Uploaded",
        contentType: "mp4",
    }
];
