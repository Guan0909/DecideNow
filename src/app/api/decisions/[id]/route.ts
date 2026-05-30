import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    if (!decision) return NextResponse.json({ error: "决定不存在" }, { status: 404 });
    return NextResponse.json(decision);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { selectedOptionId, status } = body;
    const data: Record<string, string | Date | null> = {};
    if (selectedOptionId) { data.selectedId = selectedOptionId; data.completedAt = new Date(); }
    if (status) data.status = status;
    const decision = await prisma.decision.update({ where: { id }, data, include: { options: { orderBy: { sortOrder: "asc" } } } });
    return NextResponse.json(decision);
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
