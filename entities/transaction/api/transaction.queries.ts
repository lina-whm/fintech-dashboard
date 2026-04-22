"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionRepository } from "./transaction.repository";
import type { Transaction } from "../model/types";

export const transactionKeys = { all: ["transactions"] as const };

export function useTransactionsQuery() {
  return useQuery<Transaction[]>({
    queryKey: transactionKeys.all,
    queryFn: () => transactionRepository.list(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}