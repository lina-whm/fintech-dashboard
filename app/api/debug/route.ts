import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

function mask(val: string | undefined, label: string): string {
  if (!val) return `${label}: NOT SET`;
  if (val.length < 8) return `${label}: ${val}`;
  return `${label}: ${val.slice(0, 4)}...${val.slice(-4)} (len=${val.length})`;
}

export async function GET() {
  const results: Record<string, unknown> = {};

  // Env vars check
  results.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "NOT SET";
  results.NEXTAUTH_SECRET = mask(process.env.NEXTAUTH_SECRET, "NEXTAUTH_SECRET");
  results.GITHUB_CLIENT_ID = mask(process.env.GITHUB_CLIENT_ID, "GITHUB_CLIENT_ID");
  results.GITHUB_CLIENT_SECRET = mask(process.env.GITHUB_CLIENT_SECRET, "GITHUB_CLIENT_SECRET");
  results.DATABASE_URL = mask(process.env.DATABASE_URL, "DATABASE_URL");
  results.TURSO_AUTH_TOKEN = mask(process.env.TURSO_AUTH_TOKEN, "TURSO_AUTH_TOKEN");
  results.OPENROUTER_API_KEY = mask(process.env.OPENROUTER_API_KEY, "OPENROUTER_API_KEY");
  results.OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "NOT SET";

  // All env keys (без значений) — чтобы увидеть, какие вообще есть
  results.allEnvKeys = Object.keys(process.env).filter(
    (k) =>
      k.includes("AUTH") ||
      k.includes("SECRET") ||
      k.includes("GITHUB") ||
      k.includes("TURSO") ||
      k.includes("DATABASE") ||
      k.includes("OPENROUTER") ||
      k.includes("NEXTAUTH") ||
      k.includes("VERCEL")
  );

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