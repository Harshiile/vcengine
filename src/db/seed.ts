import { PrismaClient } from "../../generated/prisma";
import { seedBranch } from "./seed/branch";
import { seedUser } from "./seed/user";
import { seedVersions } from "./seed/version";
import { seedVideos } from "./seed/video";
import { seedWorkspace } from "./seed/workspace";

const prisma = new PrismaClient();

const main = async () => {
    await seedUser(prisma).catch((err) => {
        throw new Error(err.message);
    });

    await seedWorkspace(prisma).catch((err) => {
        throw new Error(err.message);
    });

    await seedBranch(prisma).catch((err) => {
        throw new Error(err.message);
    });

    await seedVersions(prisma).catch((err) => {
        throw new Error(err.message);
    });

    await seedVideos(prisma).catch((err) => {
        throw new Error(err.message);
    });
};

main()
    .catch((err) => console.log(err.message))
    .finally(async () => {
        await prisma.$disconnect();
    });
