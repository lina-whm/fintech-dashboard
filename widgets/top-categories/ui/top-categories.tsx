"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { formatCurrency } from "@/shared/lib/money";
import type { ExpenseChartItem } from "@/entities/transaction/api/transaction.service";

export function TopCategories({ data }: { data: ExpenseChartItem[] }) {
  const top3 = [...data].sort((a,b) => b.value - a.value).slice(0,3);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Топ категории расходов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top3.map(item => {
          const percent = total ? (item.value / total) * 100 : 0;
          return (
            <div key={item.name} className="flex justify-between items-center">
              <span>{item.name}</span>
              <span className="font-medium">{formatCurrency(item.value)} ({percent.toFixed(0)}%)</span>
            </div>
          );
        })}
        {top3.length === 0 && <div className="text-muted-foreground">Нет данных</div>}
      </CardContent>
    </Card>
  );
}