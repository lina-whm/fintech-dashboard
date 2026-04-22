import { describe, expect, it } from "vitest";
import { applyTransactionFilters, buildExpenseChartData, calculateSummary, sortTransactions } from "@/entities/transaction/api/transaction.service";
import type { Transaction } from "@/entities/transaction/model/types";

const transactions: Transaction[] = [
  { id: "1", title: "Salary", amount: 200000, category: "Salary", type: "income", date: "2026-04-10" },
  { id: "2", title: "Taxi", amount: 1200, category: "Transport", type: "expense", date: "2026-04-12" },
  { id: "3", title: "Groceries", amount: 6400, category: "Food", type: "expense", date: "2026-04-11" },
];

describe("transaction service", () => {
  it("sorts by date desc", () => expect(sortTransactions(transactions)[0].date).toBe("2026-04-12"));
  it("calculates summary", () => expect(calculateSummary(transactions)).toEqual({ balance: 192400, income: 200000, expenses: 7600 }));
  it("filters by search and date", () => {
    const filtered = applyTransactionFilters(transactions, { search: "tax", fromDate: "2026-04-12", toDate: "2026-04-12", category: "all", type: "all" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Taxi");
  });
  it("builds expense chart data", () => expect(buildExpenseChartData(transactions)).toEqual([{ name: "Food", value: 6400 }, { name: "Transport", value: 1200 }]));
});