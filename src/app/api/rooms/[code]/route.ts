import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const prisma = getPrisma();

    const room = await prisma.room.findUnique({
      where: { shareCode: params.code.toUpperCase() },
      include: {
        decision: {
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
              include: {
                _count: { select: { votes: true } },
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "房间不存在" }, { status: 404 });
    }

    // 检查是否已截止
    const now = new Date();
    const isExpired = room.deadline ? now > room.deadline : false;
    const isClosed = !!room.closedAt;

    return NextResponse.json({
      shareCode: room.shareCode,
      isAnonymous: room.isAnonymous,
      deadline: room.deadline,
      closedAt: room.closedAt,
      isExpired,
      isClosed,
      decision: {
        id: room.decision.id,
        title: room.decision.title,
        status: room.decision.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: room.decision.options.map((opt: Record<string, any>) => ({
          id: opt.id,
          name: opt.name,
          description: opt.description,
          voteCount: opt._count.votes,
          voteCountDisplay: opt.voteCount, // 从 Option 表读取的冗余计数
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: "获取房间失败" }, { status: 500 });
  }
}
