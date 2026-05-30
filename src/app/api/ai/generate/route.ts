import { NextResponse } from "next/server";
import { generateOptions } from "@/lib/ai";
import type { Constraints } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, constraints, count = 3 } = body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "请提供有效的输入内容" },
        { status: 400 }
      );
    }

    // 约束条件可选，为空时用默认值
    const safeConstraints: Constraints = constraints && typeof constraints === "object"
      ? constraints as Constraints
      : {
          people: null,
          budget: null,
          location: null,
          taste: null,
          atmosphere: null,
          occasion: null,
          keywords: [],
          rawInput: input.trim(),
        };

    const result = await generateOptions(
      input.trim(),
      safeConstraints,
      Math.min(Math.max(count, 1), 5) // 限制 1-5 个选项
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    console.error("[AI Generate Error]", message);

    if (message.includes("AI_API_KEY")) {
      return NextResponse.json(
        { error: "AI 服务未配置，请在 .env.local 中设置 AI_API_KEY" },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
