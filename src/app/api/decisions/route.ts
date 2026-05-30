import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

interface OptionInput {
  name: string;
  description?: string;
  priceHint?: string;
  locationHint?: string;
  scoreCard?: { taste: number; ambiance: number; budget: number };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, mode, constraints, options } = body;

    if (!title || !options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: "缺少必要参数：title 和 options" },
        { status: 400 }
      );
    }

    const decision = await getPrisma().decision.create({
      data: {
        title,
        mode: mode || "SINGLE",
        constraints: constraints ? JSON.stringify(constraints) : null,
        status: "PENDING",
        options: {
          create: (options as OptionInput[]).map((opt, index) => ({
            name: opt.name,
            description: opt.description || "",
            priceHint: opt.priceHint ?? null,
            locationHint: opt.locationHint ?? null,
            scoreCard: opt.scoreCard ? JSON.stringify(opt.scoreCard) : null,
            sortOrder: index,
          })),
        },
      },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建失败";
    console.error("[Decisions POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const decisions = await getPrisma().decision.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return NextResponse.json(decisions);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
