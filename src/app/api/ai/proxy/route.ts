import { NextResponse } from "next/server";

// API Key 只在服务端，浏览器永远看不到
const API_KEY = process.env.AI_API_KEY || "sk-c6544b31afef47a2b3d6a9cb0bcb3709";
const API_BASE = process.env.AI_BASE_URL || "https://api.deepseek.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model, messages, temperature, max_tokens } = body;

    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "AI 服务异常" }, { status: 502 });
  }
}
