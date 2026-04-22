import seed from "@/data/transactions.json";
import type { NewTransactionInput, Transaction } from "@/entities/transaction/model/types";

let transactions: Transaction[] = JSON.parse(JSON.stringify(seed));

export function listTransactions(): Transaction[] {
  return [...transactions];
}

export function createTransaction(input: NewTransactionInput): Transaction {
  const created: Transaction = { id: crypto.randomUUID(), ...input };
  transactions = [created, ...transactions];
  return created;
}

export function resetTransactions(): Transaction[] {
  transactions = JSON.parse(JSON.stringify(seed));
  return [...transactions];
}