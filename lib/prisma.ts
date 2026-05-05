import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL || "";

function createPrismaClient() {
  if (dbUrl.startsWith("libsql://")) {
    return new PrismaClient({
      datasources: {
        db: {
          url: "file:./dev.db",
        },
      },
    });
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;