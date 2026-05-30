"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OptionCard } from "@/components/OptionCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type { DecisionOption } from "@/lib/types";

export default function NewDecision() {
  const router = useRouter();
  const [options, setOptions] = useState<DecisionOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  interface DbOption {
    id: string;
    name: string;
    description: string;
    priceHint: string | null;
    locationHint: string | null;
    scoreCard: string | null;
    sortOrder: number;
    voteCount: number;
  }
  const [dbOptions, setDbOptions] = useState<DbOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // 从 URL 读取输入
    const params = new URLSearchParams(window.location.search);
    const input = params.get("q");

    if (!input) {
      router.replace("/");
      return;
    }

    generateAndSave(input, null);
  }, [router]);

  async function generateAndSave(
    input: string,
    constraints: ParseResult["constraints"] | null
  ) {
    setLoading(true);
    setError(null);

    try {
      // 1. 调用 AI 生成选项
      const genRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, constraints }),
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        throw new Error(err.error || "AI 生成失败");
      }

      const { options: generated } = await genRes.json();
      if (!generated || generated.length === 0) {
        throw new Error("AI 未能生成选项，请尝试更详细的描述");
      }

      setOptions(generated);

      // 2. 创建决策记录
      const saveRes = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input,
          mode: "SINGLE",
          constraints,
          options: generated,
        }),
      });

      if (!saveRes.ok) throw new Error("保存失败");

      const decision = await saveRes.json();
      setDecisionId(decision.id);
      setDbOptions(decision.options); // 保存数据库选项（含 UUID）
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect() {
    if (!decisionId || dbOptions.length === 0) return;

    // 用数据库中的 UUID 作为 selectedOptionId
    const dbOption = dbOptions[currentIndex];

    try {
      const res = await fetch(`/api/decisions/${decisionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptionId: dbOption?.id || null,
          status: "COMPLETED",
        }),
      });

      if (!res.ok) throw new Error("保存选择失败");

      setSelectedId(decisionId);
      router.push(`/decide/${decisionId}/card`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  // 加载中
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#FFF5F0] to-background px-5">
        <div className="relative">
          <Sparkles className="h-16 w-16 animate-pulse text-primary" />
          <Loader2 className="absolute -right-1 -top-1 h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-lg font-medium text-foreground">AI 正在为你思考...</p>
        <p className="text-sm text-muted-foreground">分析偏好 · 匹配选项 · 生成建议</p>
      </div>
    );
  }

  // 错误
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-center text-lg font-medium">{error}</p>
        <Button onClick={() => router.push("/")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回重试
        </Button>
      </div>
    );
  }

  // 无选项
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 py-8 safe-top safe-bottom">
      {/* 顶部 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1} / {options.length}
        </span>
      </div>

      {/* 卡片区 */}
      <div className="flex flex-1 flex-col items-center justify-center pb-4">
        <OptionCard
          key={currentIndex}
          option={options[currentIndex]}
          index={currentIndex}
          total={options.length}
          onSelect={handleSelect}
          onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() =>
            setCurrentIndex((i) => Math.min(options.length - 1, i + 1))
          }
          isSelected={selectedId !== null}
        />
      </div>

      {/* 底部提示 */}
      <p className="text-center text-xs text-muted-foreground/40">
        👆 左右滑动切换选项 · 点击「就它了」做决定
      </p>
    </div>
  );
}
