"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
          placeholder="Поиск"
          value={filters.search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => filters.setSearch(e.target.value)}
        />
        <Input
          type="date"
          value={filters.fromDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => filters.setFromDate(e.target.value)}
        />
        <Input
          type="date"
          value={filters.toDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => filters.setToDate(e.target.value)}
        />
        <Select
          value={filters.category}
          onValueChange={(value: TransactionCategory | "all") => filters.setCategory(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {transactionCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value: TransactionType | "all") => filters.setType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {transactionTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "income" ? "Доход" : "Расход"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={filters.resetFilters} className="lg:col-span-5">
          Сбросить
        </Button>
      </CardContent>
    </Card>
  );
}