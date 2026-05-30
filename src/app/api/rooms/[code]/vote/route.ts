import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const body = await request.json();
    const { optionId, reason } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: "请选择一个选项" },
        { status: 400 }
      );
    }

    const code = params.code.toUpperCase();

    // 查找房间
    const room = await prisma.room.findUnique({
      where: { shareCode: code },
      include: {
        decision: { include: { options: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "房间不存在" }, { status: 404 });
    }

    // 检查是否已截止
    if (room.closedAt) {
      return NextResponse.json({ error: "投票已截止" }, { status: 410 });
    }
    if (room.deadline && new Date() > room.deadline) {
      return NextResponse.json({ error: "投票已过期" }, { status: 410 });
    }

    // 验证选项属于这个决定
    const validOption = room.decision.options.find((o: { id: string }) => o.id === optionId);
    if (!validOption) {
      return NextResponse.json({ error: "无效的选项" }, { status: 400 });
    }

    // 创建投票
    const vote = await prisma.vote.create({
      data: {
        optionId,
        reason: reason || null,
        isAnonymous: room.isAnonymous,
      },
    });

    // 更新选项的冗余票数（用于快速查询）
    await prisma.option.update({
      where: { id: optionId },
      data: { voteCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, voteId: vote.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "投票失败";
    console.error("[Vote POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
