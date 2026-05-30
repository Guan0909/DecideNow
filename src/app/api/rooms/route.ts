import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShareCode } from "@/lib/utils";

interface OptionInput {
  name: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, options: optionNames, isAnonymous, deadlineHours } = body;

    if (!title || !optionNames || !Array.isArray(optionNames) || optionNames.length < 2) {
      return NextResponse.json(
        { error: "至少需要 2 个选项" },
        { status: 400 }
      );
    }


    // 生成唯一分享码
    let shareCode = generateShareCode();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.room.findUnique({ where: { shareCode } });
      if (!exists) break;
      shareCode = generateShareCode();
      attempts++;
    }

    // 计算截止时间
    const hours = Math.min(Math.max(deadlineHours || 24, 1), 168); // 1-168 小时
    const deadline = new Date(Date.now() + hours * 3600000);

    // 创建决策 + 房间
    const result = await prisma.decision.create({
      data: {
        title,
        mode: "MULTI",
        status: "PENDING",
        options: {
          create: (optionNames as (string | OptionInput)[]).map((opt, index) => ({
            name: typeof opt === "string" ? opt : opt.name,
            description: typeof opt === "string" ? "" : (opt.description || ""),
            sortOrder: index,
          })),
        },
        room: {
          create: {
            shareCode,
            isAnonymous: isAnonymous || false,
            deadline,
          },
        },
      },
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        room: true,
      },
    });

    return NextResponse.json(
      {
        shareCode: result.room!.shareCode,
        shareUrl: `${request.headers.get("origin") || ""}/room/${result.room!.shareCode}`,
        deadline: result.room!.deadline,
        decisionId: result.id,
        options: result.options,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建失败";
    console.error("[Rooms POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
