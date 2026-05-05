import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export interface TransactionRow {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "Доход" | "Расход";
  date: string;
  createdAt: string;
  userId: string | null;
}

export async function getTransactions(weekAgoStr: string): Promise<TransactionRow[]> {
  const result = await turso.execute({
    sql: `SELECT * FROM transactions WHERE date >= ? ORDER BY date DESC`,
    args: [weekAgoStr],
  });
  
  return result.rows as unknown as TransactionRow[];
}