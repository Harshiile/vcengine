import { PrismaClient } from "../../../generated/prisma";
import { seedUser } from "./user";
import { seedWorkspace } from "./workspace";

const prisma = new PrismaClient();

const main = async () => {
  seedUser(prisma).catch((err) => {
    throw new Error(err.message);
  });
  seedWorkspace(prisma).catch((err) => {
    throw new Error(err.message);
  });
};

main()
  .catch((err) => console.log(err.message))
  .finally(async () => {
    await prisma.$disconnect();
  });
