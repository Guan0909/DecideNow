"use client";

import { useState } from "react";
import { InputEngine } from "@/components/InputEngine";
import { QuickTags } from "@/components/QuickTags";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/OptionCard";
import { DecisionResult } from "@/components/DecisionResult";
import {
  Sparkles,
  Users,
  User,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import type { DecisionOption } from "@/lib/types";

type View = "input" | "loading" | "cards" | "result";

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

export default function Home() {
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [view, setView] = useState<View>("input");
  const [options, setOptions] = useState<DecisionOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisionData, setDecisionData] = useState<{
    title: string;
    completedAt: string;
    options: Array<Record<string, unknown>>;
    selectedId: string;
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dbOptions, setDbOptions] = useState<DbOption[]>([]);

  const handleTagSelect = (template: string) => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(textarea, template);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const handleSubmit = async (input: string) => {
    if (mode === "multi") {
      window.location.href = "/room/create?q=" + encodeURIComponent(input);
      return;
    }

    // 单人模式：内联处理
    setView("loading");
    setError(null);

    try {
      const genRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, constraints: null }),
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        throw new Error(err.error || "AI 生成失败");
      }

      const { options: generated } = await genRes.json();
      if (!generated || generated.length === 0) {
        throw new Error("AI 未能生成选项");
      }

      setOptions(generated);
      setCurrentIndex(0);
      setView("cards");

      // 保存到数据库
      const saveRes = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input,
          mode: "SINGLE",
          options: generated,
        }),
      });

      if (saveRes.ok) {
        const decision = await saveRes.json();
        setDbOptions(decision.options);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    }
  };

  const handleSelect = async () => {
    try {
      setSelectedIndex(currentIndex);
      setDecisionData({
        title: "",
        completedAt: new Date().toISOString(),
        options: options.map((o, i) => ({
          id: dbOptions[i]?.id || String(i),
          name: o.name,
          description: o.description,
          priceHint: o.priceHint,
          locationHint: o.locationHint,
          scoreCard: JSON.stringify(o.scoreCard),
        })),
        selectedId: dbOptions[currentIndex]?.id || String(currentIndex),
      });
      setView("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  };

  const handleBack = () => {
    setView("input");
    setOptions([]);
    setError(null);
    setDbOptions([]);
  };

  // 加载中
  if (view === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#FFF5F0] to-background px-5">
        <Sparkles className="h-16 w-16 animate-pulse text-primary" />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-lg font-medium">AI 正在为你思考...</p>
        <p className="text-sm text-muted-foreground">分析偏好 · 匹配选项 · 生成建议</p>
      </div>
    );
  }

  // 卡片浏览
  if (view === "cards" && options.length > 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> 返回
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1} / {options.length}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center pb-4">
          <OptionCard
            option={options[currentIndex]}
            index={currentIndex}
            total={options.length}
            onSelect={handleSelect}
            onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onNext={() =>
              setCurrentIndex((i) => Math.min(options.length - 1, i + 1))
            }
            isSelected={false}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground/40">
          👆 左右滑动切换选项 · 点击「就它了」做决定
        </p>
      </div>
    );
  }

  // 结果页
  if (view === "result" && decisionData) {
    return (
      <div className="mx-auto max-w-lg px-5 py-8">
        <DecisionResult decision={decisionData} selectedIndex={selectedIndex} />
        <div className="mt-8 text-center">
          <button onClick={handleBack} className="text-sm text-primary hover:underline">
            ← 再来一次
          </button>
        </div>
      </div>
    );
  }

  // 错误页
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-center text-lg font-medium">{error}</p>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> 返回重试
        </Button>
      </div>
    );
  }

  // 默认：输入页
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#FFF5F0] via-background to-background safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pt-12">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              DecideNow
            </h1>
          </div>
          <p className="text-base text-muted-foreground">让每一个纠结都有答案</p>
        </div>

        <div className="mb-6 flex rounded-2xl bg-muted p-1">
          <button
            onClick={() => setMode("single")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              mode === "single" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> 单人决策
          </button>
          <button
            onClick={() => setMode("multi")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              mode === "multi" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" /> 多人投票
          </button>
        </div>

        <InputEngine mode={mode} onSubmit={handleSubmit} />

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground/50">快捷场景</span>
          <Separator className="flex-1" />
        </div>

        <QuickTags onSelect={handleTagSelect} />

        <div className="mt-auto flex flex-col items-center gap-3 py-6">
          <p className="text-center text-xs text-muted-foreground/40">
            无需注册，打开即用 · AI 驱动 · 朋友一起决定
          </p>
        </div>
      </div>
    </main>
  );
}
