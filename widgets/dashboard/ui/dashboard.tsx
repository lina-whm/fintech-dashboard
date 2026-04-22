"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTransactionsQuery } from "@/entities/transaction/api/transaction.queries";
import { applyTransactionFilters, buildExpenseChartData, calculateSummary, sortTransactions } from "@/entities/transaction/api/transaction.service";
import { useTransactionFiltersStore } from "@/features/transaction-filters/model/filter-store";
import { BalanceCard } from "@/widgets/balance-card/ui/balance-card";
import { FiltersBar } from "@/widgets/filters-bar/ui/filters-bar";
import { TransactionTable } from "@/widgets/transaction-table/ui/transaction-table";
import { AddTransactionForm } from "@/features/transaction-add/ui/add-transaction-form";
import { Card, CardContent } from "@/shared/ui/card";

const ExpenseChart = dynamic(() => import("@/widgets/expense-chart/ui/expense-chart").then(m => m.ExpenseChart), { ssr: false, loading: () => <div className="h-[320px] rounded-2xl border bg-muted/20" /> });

export function Dashboard() {
  const { data = [], isLoading, error } = useTransactionsQuery();
  const filters = useTransactionFiltersStore();
  const filtered = applyTransactionFilters(data, filters);
  const sorted = sortTransactions(filtered);
  const summary = calculateSummary(sorted);
  const chartData = buildExpenseChartData(filtered);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4"><Image src="/brand-mark.svg" alt="logo" width={48} height={48} priority /><div><p className="text-sm text-muted-foreground">Personal finance cabinet</p><h1 className="text-2xl font-semibold">FinTech Dashboard</h1></div></div>
        </header>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2"><BalanceCard summary={summary} /><ExpenseChart data={chartData} /></div>
            <FiltersBar />
            {isLoading && <Card><CardContent className="p-6">Загрузка...</CardContent></Card>}
            {error && <Card className="border-destructive/20 bg-destructive/5"><CardContent className="p-6 text-destructive">Ошибка загрузки</CardContent></Card>}
            {!isLoading && !error && <TransactionTable transactions={sorted} />}
          </div>
          <div><AddTransactionForm /></div>
        </div>
      </div>
    </main>
  );
}