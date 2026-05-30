"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputEngine } from "@/components/InputEngine";
import { QuickTags } from "@/components/QuickTags";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Users, User } from "lucide-react";
import type { ParseResult } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"single" | "multi">("single");

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

  const handleSubmit = async (input: string, parseResult: ParseResult | null) => {
    sessionStorage.setItem("decidenow_input", input);
    if (parseResult) {
      sessionStorage.setItem("decidenow_constraints", JSON.stringify(parseResult));
    }
    sessionStorage.setItem("decidenow_mode", mode);

    if (mode === "single") {
      router.push("/decide/new");
    } else {
      router.push("/room/create");
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#FFF5F0] via-background to-background safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pt-12">
        {/* 品牌区 */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              DecideNow
            </h1>
          </div>
          <p className="text-base text-muted-foreground">
            让每一个纠结都有答案
          </p>
        </div>

        {/* 模式切换 */}
        <div className="mb-6 flex rounded-2xl bg-muted p-1">
          <button
            onClick={() => setMode("single")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              mode === "single"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            单人决策
          </button>
          <button
            onClick={() => setMode("multi")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              mode === "multi"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            多人投票
          </button>
        </div>

        {/* 主输入区 */}
        <InputEngine mode={mode} onSubmit={handleSubmit} />

        {/* 分隔线 */}
        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground/50">快捷场景</span>
          <Separator className="flex-1" />
        </div>

        {/* 快捷标签 */}
        <QuickTags onSelect={handleTagSelect} />

        {/* 底部 */}
        <div className="mt-auto flex flex-col items-center gap-3 py-6">
          <button
            onClick={() => router.push("/history")}
            className="text-sm text-muted-foreground/60 hover:text-primary transition-colors"
          >
            📋 我的决定库
          </button>
          <p className="text-center text-xs text-muted-foreground/40">
            无需注册，打开即用 · AI 驱动 · 朋友一起决定
          </p>
        </div>
      </div>
    </main>
  );
}
