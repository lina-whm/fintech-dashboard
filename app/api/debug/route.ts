import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Проверка DATABASE_URL из process.env
  results.databaseUrlFromEnv = process.env.DATABASE_URL || "NOT SET";

  // 2. Проверка DATABASE_URL из .env.local
  results.databaseUrlFromLocal = process.env.DATABASE_URL_LOCAL || "NOT SET";

  // 3. Попробуем создать PrismaClient с явным URL
  try {
    const testPrisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL },
      },
    });
    await testPrisma.$connect();
    const count = await testPrisma.transaction.count();
    results.connectedWithExplicitUrl = true;
    results.transactionCount = count;
    await testPrisma.$disconnect();
  } catch (e) {
    results.connectedWithExplicitUrl = false;
    results.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}