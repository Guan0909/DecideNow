import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const decision = await prisma.decision.findUnique({
      where: { id: params.id },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!decision) {
      return NextResponse.json({ error: "决定不存在" }, { status: 404 });
    }

    return NextResponse.json(decision);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { selectedOptionId, status } = body;

    const data: Record<string, string | Date | null> = {};
    if (selectedOptionId) data.selectedId = selectedOptionId;
    if (status) data.status = status;
    if (selectedOptionId) data.completedAt = new Date();

    const decision = await prisma.decision.update({
      where: { id: params.id },
      data,
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(decision);
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
