import { NextResponse } from "next/server";
import { resetTransactions } from "@/server/transactions/transaction-store";

export async function POST() {
  resetTransactions();
  return NextResponse.json({ success: true });
}