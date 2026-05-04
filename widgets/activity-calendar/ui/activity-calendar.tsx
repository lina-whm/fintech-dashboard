"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { formatCurrency } from "@/shared/lib/money";
import type { Transaction } from "@/entities/transaction/model/types";

interface DayData {
  date: string;
  count: number;
  totalAmount: number;
  categories: string[];
}

interface ActivityCalendarProps {
  transactions: Transaction[];
}

const DAYS = 30;

export function ActivityCalendar({ transactions }: ActivityCalendarProps) {
  const { days, maxCount, monthLabels } = useMemo(() => {
    const dayMap: Record<string, DayData> = {};
    let max = 0;

    transactions.forEach((t) => {
      const dateKey = t.date.split("T")[0];
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { date: dateKey, count: 0, totalAmount: 0, categories: [] };
      }
      dayMap[dateKey].count += 1;
      dayMap[dateKey].totalAmount += t.amount;
      dayMap[dateKey].categories.push(t.category);
      if (dayMap[dateKey].count > max) max = dayMap[dateKey].count;
    });

    const result: { date: Date; data: DayData; month: string }[] = [];
    const monthLabels: { month: string; startIdx: number }[] = [];
    let currentMonth = "";

    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const month = d.toLocaleDateString("ru-RU", { month: "short" });
      
      if (month !== currentMonth) {
        currentMonth = month;
        monthLabels.push({ month, startIdx: DAYS - 1 - i });
      }
      
      result.push({ 
        date: d, 
        data: dayMap[key] || { date: key, count: 0, totalAmount: 0, categories: [] },
        month
      });
    }

    return { days: result, maxCount: max || 1, monthLabels };
  }, [transactions]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/30 dark:bg-gray-700";
    const ratio = count / maxCount;
    if (ratio <= 0.33) return "bg-emerald-300 dark:bg-emerald-700";
    if (ratio <= 0.66) return "bg-emerald-400 dark:bg-emerald-600";
    return "bg-emerald-500 dark:bg-emerald-500";
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="shadow-soft border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
      <CardHeader className="pb-1 px-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm dark:text-gray-200">Активность</CardTitle>
        <span className="text-[10px] text-muted-foreground dark:text-gray-400">{days.length} дней</span>
      </CardHeader>
      <CardContent className="px-3">
        {/* Месяцы */}
        <div className="flex mb-1 ml-1">
          {monthLabels.map((m, i) => (
            <span 
              key={m.month + i} 
              className="text-[9px] text-muted-foreground dark:text-gray-500"
              style={{ marginLeft: i === 0 ? m.startIdx * 18 : (m.startIdx - monthLabels[i-1].startIdx - 1) * 18 }}
            >
              {m.month}
            </span>
          ))}
        </div>
        
        {/* Дни */}
        <div className="flex gap-0.5 overflow-x-auto pb-1">
          {days.map(({ date, data, month }) => {
            const isToday = date.toISOString().split("T")[0] === today;
            const dateStr = date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
            return (
              <div
                key={date.toISOString()}
                className={`w-4 h-4 rounded-sm ${getColor(data.count)} shrink-0 ${isToday ? "ring-2 ring-primary dark:ring-primary-400" : ""}`}
                title={`${dateStr}: ${data.count > 0 ? formatCurrency(data.totalAmount) + " • " + data.count + " транз." : "нет транзакций"}`}
              />
            );
          })}
        </div>
        
        {/* Числа */}
        <div className="flex ml-1">
          {days.filter((_, i) => i % 5 === 0).map(({ date }, i, arr) => (
            <span 
              key={i} 
              className="text-[8px] text-muted-foreground dark:text-gray-500"
              style={{ width: 90, marginLeft: i === 0 ? 0 : 18 }}
            >
              {date.getDate()}
            </span>
          ))}
        </div>

        {/* Легенда */}
        <div className="flex items-center justify-center gap-2 mt-2 text-[9px] text-muted-foreground dark:text-gray-500">
          <span>нет</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-muted/30 dark:bg-gray-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
          </div>
          <span>много</span>
        </div>
      </CardContent>
    </Card>
  );
}