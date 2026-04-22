import { create } from "zustand";
import type { TransactionCategory, TransactionType } from "@/entities/transaction/model/types";

interface FilterStore {
  search: string;
  fromDate: string;
  toDate: string;
  category: TransactionCategory | "all";
  type: TransactionType | "all";
  setSearch: (s: string) => void;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
  setCategory: (c: TransactionCategory | "all") => void;
  setType: (t: TransactionType | "all") => void;
  resetFilters: () => void;
}

export const useTransactionFiltersStore = create<FilterStore>((set) => ({
  search: "", fromDate: "", toDate: "", category: "all", type: "all",
  setSearch: (search) => set({ search }),
  setFromDate: (fromDate) => set({ fromDate }),
  setToDate: (toDate) => set({ toDate }),
  setCategory: (category) => set({ category }),
  setType: (type) => set({ type }),
  resetFilters: () => set({ search: "", fromDate: "", toDate: "", category: "all", type: "all" }),
}));