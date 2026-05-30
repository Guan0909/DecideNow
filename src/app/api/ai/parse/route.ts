import { NextResponse } from "next/server";
import { parseConstraints } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "请提供有效的输入内容" },
        { status: 400 }
      );
    }

    if (input.trim().length < 3) {
      return NextResponse.json(
        { error: "输入内容太短，请描述得更详细一些" },
        { status: 400 }
      );
    }

    const result = await parseConstraints(input.trim());
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "解析失败";
    console.error("[AI Parse Error]", message);

    if (message.includes("AI_API_KEY")) {
      return NextResponse.json(
        { error: "AI 服务未配置，请在 .env.local 中设置 AI_API_KEY" },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
