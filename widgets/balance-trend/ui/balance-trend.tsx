"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/shared/lib/money";
import type { Transaction } from "@/entities/transaction/model/types";

interface BalanceTrendProps {
  transactions: Transaction[];
}

export function BalanceTrend({ transactions }: BalanceTrendProps) {
  const sorted = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const data = sorted.map(t => {
    runningBalance += t.type === "income" ? t.amount : -t.amount;
    return { date: t.date, balance: runningBalance };
  });
  const unique = data.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) existing.balance = curr.balance;
    else acc.push(curr);
    return acc;
  }, [] as typeof data);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Динамика баланса</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={unique}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(v) => formatCurrency(v).replace("RUB", "").trim()} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Line type="monotone" dataKey="balance" stroke="#0F172A" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}