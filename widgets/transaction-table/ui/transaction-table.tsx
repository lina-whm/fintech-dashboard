"use client";

import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/shared/lib/money";
import { formatDate } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";
import type { Transaction } from "@/entities/transaction/model/types";
import { useDeleteTransactionMutation } from "@/features/transaction-delete/model/use-delete-transaction";
import { EditTransactionDialog } from "@/features/transaction-edit/ui/edit-transaction-dialog";
import ReactPaginate from "react-paginate";

interface TransactionTableProps {
  transactions: Transaction[];
}

const ITEMS_PER_PAGE = 5;

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { mutate: deleteTransaction } = useDeleteTransactionMutation();

  const pageCount = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(offset, offset + ITEMS_PER_PAGE);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Последние транзакции</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Нет данных</TableCell>
                </TableRow>
              ) : (
                currentTransactions.map((t) => (
                  <TableRow key={t.id} data-testid="transaction-row">
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        t.type === "Доход" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {t.type}
                      </span>
                    </TableCell>
                    <TableCell className={cn("text-right font-medium", t.type === "Доход" ? "text-emerald-600" : "text-rose-600")}>
                      {t.type === "Расход" ? "-" : "+"}{formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(t)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {pageCount > 1 && (
            <div className="mt-4 flex justify-center">
              <ReactPaginate
                previousLabel={"←"}
                nextLabel={"→"}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={"flex gap-2"}
                pageClassName={"rounded-md border px-3 py-1"}
                activeClassName={"bg-primary text-primary-foreground"}
                previousClassName={"rounded-md border px-3 py-1"}
                nextClassName={"rounded-md border px-3 py-1"}
                disabledClassName={"opacity-50"}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <EditTransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </>
  );
}