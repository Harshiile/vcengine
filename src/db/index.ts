import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

export const getPrismaInstance = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["warn", "error"],
    });
  }

  return globalForPrisma.prisma;
};
