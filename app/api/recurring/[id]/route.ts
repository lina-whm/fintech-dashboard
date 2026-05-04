import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateNextOccurrence, type RecurringFrequency } from "@/lib/recurring";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { ...body };

    if (body.frequency || body.interval || body.dayOfWeek || body.dayOfMonth || body.startDate) {
      const frequency = (body.frequency || existing.frequency) as RecurringFrequency;
      const interval = body.interval ?? existing.interval;
      const dayOfWeek = body.dayOfWeek ?? existing.dayOfWeek;
      const dayOfMonth = body.dayOfMonth ?? existing.dayOfMonth;
      const startDate = body.startDate ? new Date(body.startDate) : existing.startDate;
      const endDate = body.endDate ? new Date(body.endDate) : existing.endDate;

      const nextOccurrence = calculateNextOccurrence({
        frequency,
        interval,
        dayOfWeek: dayOfWeek || undefined,
        dayOfMonth: dayOfMonth || undefined,
        startDate,
        endDate: endDate || undefined,
      });

      if (nextOccurrence) {
        updateData.nextOccurrence = nextOccurrence;
      }
    }

    const updated = await prisma.recurringTransaction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating recurring transaction:", error);
    return NextResponse.json({ message: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    return NextResponse.json({ message: "Failed to delete" }, { status: 400 });
  }
}