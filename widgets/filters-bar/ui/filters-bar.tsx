"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { transactionCategories, transactionTypes } from "@/entities/transaction/model/types";
import { useTransactionFiltersStore } from "@/features/transaction-filters/model/filter-store";
import type { TransactionCategory, TransactionType } from "@/entities/transaction/model/types";

export function FiltersBar() {
  const filters = useTransactionFiltersStore();

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Фильтры</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-5">
        <Input
          placeholder="Поиск по названию или категории"
          value={filters.search}
          onChange={(e) => filters.setSearch(e.target.value)}
        />
        <Input
          type="date"
          value={filters.fromDate}
          onChange={(e) => filters.setFromDate(e.target.value)}
          placeholder="От"
        />
        <Input
          type="date"
          value={filters.toDate}
          onChange={(e) => filters.setToDate(e.target.value)}
          placeholder="До"
        />
        <Select value={filters.category} onValueChange={(v) => filters.setCategory(v as TransactionCategory | "все")}>
          <SelectTrigger><SelectValue placeholder="Категория" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="все">Все категории</SelectItem>
            {transactionCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.type} onValueChange={(v) => filters.setType(v as TransactionType | "все")}>
          <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="все">Все типы</SelectItem>
            {transactionTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={filters.resetFilters} className="lg:col-span-5">
          Сбросить фильтры
        </Button>
      </CardContent>
    </Card>
  );
}