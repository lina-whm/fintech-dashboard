import { NextResponse } from "next/server";
import { createTransaction, listTransactions } from "@/server/transactions/transaction-store";
import { newTransactionSchema } from "@/entities/transaction/model/types";

export async function GET() {
  return NextResponse.json(listTransactions());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = newTransactionSchema.parse(body);
    return NextResponse.json(createTransaction(input), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid data" }, { status: 400 });
  }
}