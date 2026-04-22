"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { formatCurrency } from "@/shared/lib/money";
import type { ExpenseChartItem } from "@/entities/transaction/api/transaction.service";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0F172A", "#1D4ED8", "#7C3AED", "#059669", "#D97706", "#BE123C", "#475569"];

export function ExpenseChart({ data }: { data: ExpenseChartItem[] }) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Расходы по категориям</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Нет расходов за выбранный период
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={62}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}