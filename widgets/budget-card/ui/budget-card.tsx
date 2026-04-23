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
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>("Food");
  const [limit, setLimit] = useState("");

  const handleSetBudget = () => {
    const numLimit = parseFloat(limit);
    if (!isNaN(numLimit) && numLimit > 0) {
      setBudget(selectedCategory, numLimit);
      setLimit("");
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Бюджеты по категориям</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TransactionCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{transactionCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Лимит"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-32"
          />
          <Button onClick={handleSetBudget}>Установить</Button>
        </div>
        <div className="space-y-2">
          {transactionCategories.map(cat => {
            const budget = getBudget(cat);
            if (budget === 0) return null;
            const spent = expensesByCategory[cat] || 0;
            const percent = Math.min(100, (spent / budget) * 100);
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm">
                  <span>{cat}</span>
                  <span>{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
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