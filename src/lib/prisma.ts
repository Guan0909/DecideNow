// ============================================
// Prisma 客户端单例
// ============================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL 环境变量未设置");

  // Prisma v7 需要显式传入 datasources
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
