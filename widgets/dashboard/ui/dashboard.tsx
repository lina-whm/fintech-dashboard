"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTransactionsQuery } from "@/entities/transaction/api/transaction.queries";
import {
  applyTransactionFilters,
  buildExpenseChartData,
  calculateSummary,
  sortTransactions,
} from "@/entities/transaction/api/transaction.service";
import { useTransactionFiltersStore } from "@/features/transaction-filters/model/filter-store";
import { BalanceCard } from "@/widgets/balance-card/ui/balance-card";
import { FiltersBar } from "@/widgets/filters-bar/ui/filters-bar";
import { TransactionTable } from "@/widgets/transaction-table/ui/transaction-table";
import { TransactionTableSkeleton } from "@/widgets/transaction-table/ui/transaction-table-skeleton";
import { AddTransactionForm } from "@/features/transaction-add/ui/add-transaction-form";
import { ThemeToggle } from "@/widgets/theme-toggle/ui/theme-toggle";
import { BudgetCard } from "@/widgets/budget-card/ui/budget-card";
import { TopCategories } from "@/widgets/top-categories/ui/top-categories";
import { BalanceTrend } from "@/widgets/balance-trend/ui/balance-trend";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Download } from "lucide-react";
import { AIChat } from "@/widgets/ai-chat/ui/ai-chat";
import { AIInsight } from "@/widgets/ai-insight/ui/ai-insight";

const ExpenseChart = dynamic(() => import("@/widgets/expense-chart/ui/expense-chart").then(m => m.ExpenseChart), {
  ssr: false,
  loading: () => <div className="h-[320px] rounded-2xl border bg-muted/20" />,
});

export function Dashboard() {
  const { data = [], isLoading, error } = useTransactionsQuery();
  const filters = useTransactionFiltersStore();
  const filtered = applyTransactionFilters(data, filters);
  const sorted = sortTransactions(filtered);
  const summary = calculateSummary(sorted);
  const chartData = buildExpenseChartData(filtered);
  
  const expensesByCategory = filtered
    .filter(t => t.type === "Расход")   // ← исправлено: было "expense"
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const exportToCSV = () => {
    const headers = ["ID", "Название", "Сумма", "Категория", "Тип", "Дата"];
    const rows = filtered.map(t => [t.id, t.title, t.amount, t.category, t.type, t.date]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border bg-white dark:bg-slate-900 p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/brand-mark.svg" alt="logo" width={48} height={48} priority />
            <div>
              <p className="text-sm text-muted-foreground">Личный финансовый кабинет</p>
              <h1 className="text-2xl font-semibold">FinTech Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <BalanceCard summary={summary} />
              <ExpenseChart data={chartData} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <BudgetCard expensesByCategory={expensesByCategory} />
              <TopCategories data={chartData} />
            </div>
            <BalanceTrend transactions={filtered} />
            <AIInsight />
            <FiltersBar />
            {isLoading ? (
              <TransactionTableSkeleton />
            ) : error ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-6 text-destructive">Ошибка загрузки</CardContent>
              </Card>
            ) : (
              <TransactionTable transactions={sorted} />
            )}
          </div>
          <div className="space-y-6">
            <AddTransactionForm />
            <AIChat />
          </div>
        </div>
      </div>
    </main>
  );
}