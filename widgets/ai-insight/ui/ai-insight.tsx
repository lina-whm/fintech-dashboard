"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Lightbulb } from "lucide-react";
import { useTransactionsQuery } from "@/entities/transaction/api/transaction.queries";
import { calculateSummary } from "@/entities/transaction/api/transaction.service";

export function AIInsight() {
  const { data: transactions = [] } = useTransactionsQuery();
  const [insight, setInsight] = useState("Загрузка совета...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      if (transactions.length === 0) {
        setInsight("Добавьте транзакции, чтобы получать персональные советы.");
        setIsLoading(false);
        return;
      }

      try {
        const summary = calculateSummary(transactions);
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions, summary }),
        });
        const data = await response.json();
        setInsight(data.insight);
      } catch (error) {
        setInsight("Не удалось получить совет. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [transactions]);

  return (
    <Card className="shadow-soft bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          Совет AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {isLoading ? "Анализирую данные..." : insight}
        </p>
      </CardContent>
    </Card>
  );
}