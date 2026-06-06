import { NextResponse } from "next/server";

// API Key 只在服务端，浏览器永远看不到
const API_KEY = process.env.AI_API_KEY;
const API_BASE = process.env.AI_BASE_URL || "https://api.deepseek.com";
const AI_MODEL = process.env.AI_MODEL || "deepseek-v4-pro";

export async function POST(request: Request) {
  // 1. 检查 Key 是否配置
  if (!API_KEY || API_KEY === "your-api-key-here") {
    return NextResponse.json(
      { error: "服务端 AI_API_KEY 未配置，请在 Vercel 环境变量中设置" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { model, messages, temperature = 0.7, max_tokens = 800 } = body;

    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: model || AI_MODEL,
        messages,
        temperature,
        max_tokens,
      }),
      signal: AbortSignal.timeout(30000), // 30秒超时
    });

    const data = await res.json();

    // DeepSeek 返回错误时也透传
    if (!res.ok) {
      console.error("[AI Proxy] DeepSeek error:", JSON.stringify(data));
      return NextResponse.json(
        { error: data.error?.message || data.message || `AI 返回错误 (${res.status})` },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI Proxy] 请求失败:", message);
    return NextResponse.json(
      { error: `AI 请求失败: ${message}` },
      { status: 502 }
    );
  }
}
