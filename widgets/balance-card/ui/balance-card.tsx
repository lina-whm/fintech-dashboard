import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { formatCurrency } from "@/shared/lib/money";
import type { DashboardSummary } from "@/entities/transaction/api/transaction.service";

export function BalanceCard({ summary }: { summary: DashboardSummary }) {
  return (
    <Card className="shadow-soft">
      <CardHeader><CardTitle className="text-base">Баланс</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><p className="text-3xl font-semibold" data-testid="balance-value">{formatCurrency(summary.balance)}</p><p className="text-sm text-muted-foreground">Текущий остаток</p></div>
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Доходы</p><p className="font-medium text-emerald-600" data-testid="income-value">{formatCurrency(summary.income)}</p></div>
          <div><p className="text-muted-foreground">Расходы</p><p className="font-medium text-rose-600" data-testid="expenses-value">{formatCurrency(summary.expenses)}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}