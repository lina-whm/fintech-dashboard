import { NextResponse } from "next/server";
import { getTransactionService } from "@/lib/services/service-factory";
import { newTransactionSchema } from "@/entities/transaction/model/types";

export async function GET() {
  try {
    const service = getTransactionService();
    const transactions = await service.getAll();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = newTransactionSchema.parse(body);
    const service = getTransactionService();
    const created = await service.create(input);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}