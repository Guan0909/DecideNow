import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const prisma = getPrisma();
    const code = params.code.toUpperCase();

    const room = await prisma.room.findUnique({
      where: { shareCode: code },
    });

    if (!room) {
      return NextResponse.json({ error: "房间不存在" }, { status: 404 });
    }

    if (room.closedAt) {
      return NextResponse.json({ error: "投票已截止" }, { status: 400 });
    }

    const updated = await prisma.room.update({
      where: { shareCode: code },
      data: {
        closedAt: new Date(),
        decision: {
          update: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        },
      },
      include: {
        decision: {
          include: {
            options: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, room: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "截止失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
