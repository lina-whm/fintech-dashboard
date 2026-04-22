import { http } from "@/shared/api/http-client";
import type { NewTransactionInput, Transaction } from "@/entities/transaction/model/types";

export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  create(input: NewTransactionInput): Promise<Transaction>;
  reset(): Promise<Transaction[]>;
}

export class HttpTransactionRepository implements TransactionRepository {
  list() {
    return http<Transaction[]>("/api/transactions");
  }
  create(input: NewTransactionInput) {
    return http<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(input) });
  }
  reset() {
    return http<Transaction[]>("/api/transactions/reset", { method: "POST" });
  }
}

export const transactionRepository = new HttpTransactionRepository();