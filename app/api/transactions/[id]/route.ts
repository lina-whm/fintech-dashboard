import { NextRequest, NextResponse } from "next/server";
import { getTransaction, updateTransaction, deleteTransaction } from "@/server/transactions/transaction-store";
import { newTransactionSchema } from "@/entities/transaction/model/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateTransaction(id, body);
    if (!updated) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteTransaction(id);
  if (!deleted) {
    return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}