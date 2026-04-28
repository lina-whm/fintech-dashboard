import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Если нет TURSO_AUTH_TOKEN — используем обычный PrismaClient (для локальной разработки)
  if (!authToken) {
    return new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  // Для Turso — используем libsql драйвер
  const adapter = new PrismaLibSql({ url: url!, authToken });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;