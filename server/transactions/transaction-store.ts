import seed from "@/data/transactions.json";
import type { NewTransactionInput, Transaction } from "@/entities/transaction/model/types";

let transactions: Transaction[] = JSON.parse(JSON.stringify(seed));

export function listTransactions(): Transaction[] {
  return [...transactions];
}

export function getTransaction(id: string): Transaction | undefined {
  return transactions.find(t => t.id === id);
}

export function createTransaction(input: NewTransactionInput): Transaction {
  const created: Transaction = { id: crypto.randomUUID(), ...input };
  transactions = [created, ...transactions];
  return created;
}

export function updateTransaction(id: string, input: Partial<NewTransactionInput>): Transaction | null {
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return null;
  const updated = { ...transactions[index], ...input };
  transactions = [updated, ...transactions.filter(t => t.id !== id)];
  return updated;
}

export function deleteTransaction(id: string): boolean {
  const exists = transactions.some(t => t.id === id);
  if (!exists) return false;
  transactions = transactions.filter(t => t.id !== id);
  return true;
}

export function resetTransactions(): Transaction[] {
  transactions = JSON.parse(JSON.stringify(seed));
  return [...transactions];
}