// ============================================
// DecideNow - AI SDK 封装（OpenAI 兼容格式）
// 支持 DeepSeek 及任意 OpenAI 兼容 API
// ============================================

import OpenAI from "openai";
import type { ParseResult, GenerateResponse, Constraints } from "./types";
import { PARSE_SYSTEM_PROMPT, GENERATE_SYSTEM_PROMPT, buildParseUserPrompt, buildGenerateUserPrompt } from "./prompts";

/** 创建 AI 客户端（从环境变量读取配置） */
function createClient(): OpenAI {
  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL || "https://api.deepseek.com/v1";

  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("AI_API_KEY 未配置，请在 .env.local 中设置");
  }

  return new OpenAI({ apiKey, baseURL, timeout: 25000, maxRetries: 1 });
}

// 延迟初始化，避免 build 时无 Key 报错
let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = createClient();
  return _client;
}

/** 获取配置的模型名 */
function getModel(): string {
  return process.env.AI_MODEL || "deepseek-chat";
}

// ============================================
// 解析约束条件
// ============================================
export async function parseConstraints(input: string): Promise<ParseResult> {
  const client = getClient();
  const model = getModel();

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: PARSE_SYSTEM_PROMPT },
      { role: "user", content: buildParseUserPrompt(input) },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI 解析返回空结果");

  // 提取 JSON（处理可能的 markdown 代码块包裹）
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`AI 返回非 JSON 格式: ${content.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]) as ParseResult;
}

// ============================================
// 生成决策选项
// ============================================
export async function generateOptions(
  input: string,
  constraints: Constraints,
  count: number = 3
): Promise<GenerateResponse> {
  const client = getClient();
  const model = getModel();

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: GENERATE_SYSTEM_PROMPT.replace("3 个", `${count} 个`) },
      { role: "user", content: buildGenerateUserPrompt(input, constraints) },
    ],
    temperature: 0.8,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI 生成返回空结果");

  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`AI 返回非 JSON 格式: ${content.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]) as GenerateResponse;

  if (!parsed.options || parsed.options.length === 0) {
    throw new Error("AI 未生成任何选项");
  }

  return parsed;
}
