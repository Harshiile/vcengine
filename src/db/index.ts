import { PrismaClient } from "../../generated/prisma/client";

const globalPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const getPrismaInstance = () => {
  return globalPrisma.prisma || new PrismaClient();
};
