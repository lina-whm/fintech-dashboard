"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionCategories, transactionTypes } from "@/entities/transaction/model/types";
import { useAddTransactionMutation } from "../model/use-add-transaction";
import { transactionFormSchema, type TransactionFormValues } from "../model/schema";
import { getTodayISO } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ReceiptUploader } from "./receipt-uploader";

export function AddTransactionForm() {
  const mutation = useAddTransactionMutation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "Еда",
      type: "Расход",
      date: getTodayISO(),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    reset({
      title: "",
      amount: 0,
      category: "Еда",
      type: "Расход",
      date: getTodayISO(),
    });
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Добавить транзакцию</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <ReceiptUploader onDataFilled={(data) => {
            setValue("title", data.title);
            setValue("amount", data.amount);
            setValue("date", data.date);
            setValue("category", data.category as any);
            setValue("type", "Расход");
          }} />
        </div>
        <form onSubmit={onSubmit} className="grid gap-4" data-testid="transaction-form">
          <div className="grid gap-2">
            <label htmlFor="title">Название</label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="amount">Сумма (₽)</label>
            <Input id="amount" type="number" step="any" {...register("amount")} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="grid gap-2">
            <label>Категория</label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {transactionCategories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <label>Тип</label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="date">Дата</label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Сохранение..." : "Добавить"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}