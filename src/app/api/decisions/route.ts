import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {
      title,
      mode: mode || "SINGLE",
      status: "PENDING" as const,
    };
    if (constraints) {
      data.constraints = JSON.stringify(constraints);
    }

    data.options = {
      create: (options as OptionInput[]).map((opt, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const optData: Record<string, any> = {
          name: opt.name,
          description: opt.description || "",
          sortOrder: index,
        };
        if (opt.priceHint) optData.priceHint = opt.priceHint;
        if (opt.locationHint) optData.locationHint = opt.locationHint;
        if (opt.scoreCard) optData.scoreCard = JSON.stringify(opt.scoreCard);
        return optData;
      }),
    };

    const decision = await prisma.decision.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
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
    const decisions = await prisma.decision.findMany({
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
