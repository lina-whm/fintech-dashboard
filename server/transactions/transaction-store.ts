import { prisma } from "@/lib/prisma";
import type { NewTransactionInput, Transaction } from "@/entities/transaction/model/types";
import seed from "@/data/transactions.json";
import type { TransactionType } from "@prisma/client";

function mapPrismaTransaction(t: {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
}): Transaction {
  return {
    id: t.id,
    title: t.title,
    amount: t.amount,
    category: t.category as Transaction["category"],
    type: t.type === "Доход" ? "Доход" : "Расход",
    date: t.date,
  };
}

export async function listTransactions(userId?: string): Promise<Transaction[]> {
  const rows = await prisma.transaction.findMany({
    where: userId ? { userId } : {},
    orderBy: { date: "desc" },
  });
  return rows.map(mapPrismaTransaction);
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const row = await prisma.transaction.findUnique({ where: { id } });
  return row ? mapPrismaTransaction(row) : null;
}

export async function createTransaction(
  input: NewTransactionInput,
  userId?: string
): Promise<Transaction> {
  const row = await prisma.transaction.create({
    data: {
      title: input.title,
      amount: input.amount,
      category: input.category,
      type: input.type,
      date: input.date,
      userId: userId ?? null,
    },
  });
  return mapPrismaTransaction(row);
}

export async function updateTransaction(
  id: string,
  input: Partial<NewTransactionInput>
): Promise<Transaction | null> {
  try {
    const row = await prisma.transaction.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.date !== undefined && { date: input.date }),
      },
    });
    return mapPrismaTransaction(row);
  } catch {
    return null;
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    await prisma.transaction.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function resetTransactions(userId?: string): Promise<Transaction[]> {
  if (userId) {
    await prisma.transaction.deleteMany({ where: { userId } });
    const rows = await prisma.transaction.createManyAndReturn({
      data: seed.map((t: (typeof seed)[number]) => ({
        title: t.title,
        amount: t.amount,
        category: t.category,
        type: t.type as "Доход" | "Расход",
        date: t.date,
        userId,
      })),
    });
    return rows.map(mapPrismaTransaction);
  }

  // Если userId не указан — полный сброс всех транзакций (для админа)
  await prisma.transaction.deleteMany();
  const rows = await prisma.transaction.createManyAndReturn({
    data: seed.map((t: (typeof seed)[number]) => ({
      title: t.title,
      amount: t.amount,
      category: t.category,
      type: t.type as "Доход" | "Расход",
      date: t.date,
      userId: null,
    })),
  });
  return rows.map(mapPrismaTransaction);
}