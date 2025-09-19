import { PrismaClient } from "../../generated/prisma";

const globalPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const getPrismaInstance = () => {
  return globalPrisma.prisma || new PrismaClient();
};
