import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { formatCurrency } from "@/shared/lib/money";
import { formatDate } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";
import type { Transaction } from "@/entities/transaction/model/types";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="shadow-soft">
      <CardHeader><CardTitle className="text-base">Последние транзакции</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Название</TableHead><TableHead>Категория</TableHead><TableHead>Дата</TableHead><TableHead>Тип</TableHead><TableHead className="text-right">Сумма</TableHead></TableRow></TableHeader>
          <TableBody>
            {transactions.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">Нет данных</TableCell></TableRow> : transactions.map(t => (
              <TableRow key={t.id} data-testid="transaction-row">
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                <TableCell>{formatDate(t.date)}</TableCell>
                <TableCell><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", t.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>{t.type === "income" ? "Доход" : "Расход"}</span></TableCell>
                <TableCell className={cn("text-right font-medium", t.type === "income" ? "text-emerald-600" : "text-rose-600")}>{t.type === "expense" ? "-" : "+"}{formatCurrency(t.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}