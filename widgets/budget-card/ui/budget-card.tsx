"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { transactionCategories, type TransactionCategory } from "@/entities/transaction/model/types";
import { useBudgetStore } from "@/features/budget/model/budget-store";
import { formatCurrency } from "@/shared/lib/money";

interface BudgetCardProps {
  expensesByCategory: Record<TransactionCategory, number>;
}

export function BudgetCard({ expensesByCategory }: BudgetCardProps) {
  const { setBudget, getBudget } = useBudgetStore();
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>("Еда");
  const [limit, setLimit] = useState("");

  const handleSetBudget = () => {
    const numLimit = parseFloat(limit);
    if (!isNaN(numLimit) && numLimit > 0) {
      setBudget(selectedCategory, numLimit);
      setLimit("");
    }
  };

  return (
    <Card className="shadow-soft border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 !gap-0 !py-0">
      <CardHeader className="pb-1 px-3">
        <CardTitle className="text-sm">Бюджеты по категориям</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 px-3 pt-0">
        {/* Горизонтальная панель с переносом */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[120px]">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TransactionCategory)}>
              <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {transactionCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <Input
              type="number"
              placeholder="Лимит"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <Button onClick={handleSetBudget}>Установить</Button>
        </div>

        {/* Список бюджетов */}
        <div className="space-y-2">
          {transactionCategories.map((cat) => {
            const budget = getBudget(cat);
            if (budget === 0) return null;
            const spent = expensesByCategory[cat] || 0;
            const percent = Math.min(100, (spent / budget) * 100);
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm dark:text-gray-200">
                  <span>{cat}</span>
                  <span>{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden dark:bg-gray-700">
                  <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}