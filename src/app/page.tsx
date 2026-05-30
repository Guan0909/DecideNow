"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import type { DecisionOption } from "@/lib/types";
import { GENERATE_SYSTEM_PROMPT } from "@/lib/prompts";

/* ============================================
   打字机 Hook
   ============================================ */
function useTypewriter(texts: string[], speed = 60, pause = 3000) {
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);
  const textIndex = useRef(0);
  const charIndex = useRef(0);

  useEffect(() => {
    const currentText = texts[textIndex.current % texts.length];
    let timeout: NodeJS.Timeout;

    if (!deleting) {
      if (charIndex.current < currentText.length) {
        timeout = setTimeout(() => {
          setDisplay(currentText.slice(0, charIndex.current + 1));
          charIndex.current++;
        }, speed);
      } else {
        timeout = setTimeout(() => setDeleting(true), pause);
      }
    } else {
      if (charIndex.current > 0) {
        timeout = setTimeout(() => {
          setDisplay(currentText.slice(0, charIndex.current - 1));
          charIndex.current--;
        }, speed / 2);
      } else {
        setDeleting(false);
        textIndex.current++;
      }
    }
    return () => clearTimeout(timeout);
  }, [display, deleting, texts, speed, pause]);

  return display;
}

/* ============================================
   快捷胶囊
   ============================================ */
const CAPSULES = [
  { label: "两人周末微醺", icon: "🍸" },
  { label: "团队秋游去哪", icon: "🏕️" },
  { label: "今晚看什么电影", icon: "🎬" },
  { label: "约会吃什么", icon: "💕" },
];

/* ============================================
   视图状态
   ============================================ */
type View = "input" | "loading" | "cards" | "result" | "error";

export default function Home() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("input");
  const [options, setOptions] = useState<DecisionOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [decisionData, setDecisionData] = useState<Record<string, unknown> | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<"single" | "multi">("single");
  const placeholder = useTypewriter([
    "告诉 AI 你的想法，或输入选项...",
    "比如：三个人，人均80，吃辣的...",
    "比如：周末去哪玩？户外自驾...",
  ]);

  /* ---------- 胶囊点击 ---------- */
  const handleCapsule = useCallback((text: string) => {
    setInput(text);
    // 自动聚焦
    const ta = document.querySelector("textarea");
    if (ta) ta.focus();
  }, []);

  /* ---------- 提交：单人 AI ---------- */
  const handleSingle = useCallback(async () => {
    if (input.trim().length < 3) return;
    setView("loading");
    setErrorMsg(null);
    try {
      const apiKey = "sk-c6544b31afef47a2b3d6a9cb0bcb3709";
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-v4-pro",
          messages: [
            { role: "system", content: GENERATE_SYSTEM_PROMPT },
            { role: "user", content: `用户需求：${input.trim()}\n\n请生成 3 个决策选项。` },
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });
      if (!res.ok) throw new Error("AI 响应异常");
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI 返回空");
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("格式异常");
      const parsed = JSON.parse(m[0]);
      if (!parsed.options?.length) throw new Error("未生成选项");
      setOptions(parsed.options);
      setCurrentIndex(0);
      setView("cards");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "未知错误");
      setView("error");
    }
  }, [input]);

  /* ---------- 提交：多人 ---------- */
  const handleMulti = useCallback(() => {
    if (input.trim().length < 3) return;
    window.location.href = "/room/create";
  }, [input]);

  /* ---------- 选择后 ---------- */
  const handleSelect = useCallback(() => {
    setSelectedIndex(currentIndex);
    setDecisionData({
      title: input,
      completedAt: new Date().toISOString(),
      options: options.map((o) => ({
        id: String(Math.random()),
        name: o.name,
        description: o.description,
        priceHint: o.priceHint,
        locationHint: o.locationHint,
        scoreCard: JSON.stringify(o.scoreCard),
      })),
      selectedId: String(currentIndex),
    });
    setView("result");
  }, [currentIndex, options, input]);

  /* ========================================
     Loading
     ======================================== */
  if (view === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-8">
        <div className="animate-breathe text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
          <p className="text-lg font-semibold text-foreground">正在为你寻找最佳答案...</p>
        </div>
      </div>
    );
  }

  /* ========================================
     Cards (step 3 will enhance)
     ======================================== */
  if (view === "cards" && options.length > 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background px-5 py-8">
        <div className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/40">
          第 {currentIndex + 1} / {options.length} 个选项
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">最佳推荐</div>
            <h2 className="mb-3 text-2xl font-extrabold text-foreground">{options[currentIndex].name}</h2>
            <p className="mb-6 text-sm italic leading-relaxed text-muted-foreground">
              &ldquo;{options[currentIndex].description}&rdquo;
            </p>
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {options[currentIndex].priceHint && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  💰 {options[currentIndex].priceHint}
                </span>
              )}
              {options[currentIndex].locationHint && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  📍 {options[currentIndex].locationHint}
                </span>
              )}
            </div>
            <Button onClick={handleSelect} size="lg" className="w-full gap-2">
              就它了 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {/* nav */}
          <div className="mt-6 flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              ← 上一个
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex >= options.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              下一个 →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================
     Result (step 5 will enhance)
     ======================================== */
  if (view === "result" && decisionData) {
    const sel = (decisionData.options as Array<Record<string, unknown>>)[selectedIndex];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-8 text-center">
        <div className="text-6xl">🏆</div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">决定时刻</p>
        <h2 className="text-3xl font-extrabold text-foreground">{sel?.name as string}</h2>
        <p className="text-sm italic text-muted-foreground">&ldquo;{sel?.description as string}&rdquo;</p>
        <div className="flex gap-3">
          <Button onClick={() => { setView("input"); setInput(""); }} variant="outline">再来一次</Button>
          <Button onClick={() => {
            const text = `🎯 DecideNow 帮我做了决定！${sel?.name as string}`;
            navigator.clipboard.writeText(text);
            alert("已复制！");
          }}>📤 分享</Button>
        </div>
      </div>
    );
  }

  /* ========================================
     Error
     ======================================== */
  if (view === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-8 text-center">
        <p className="text-lg font-semibold text-foreground">暂时无法生成</p>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        <Button onClick={() => setView("input")} variant="outline">← 返回重试</Button>
      </div>
    );
  }

  /* ========================================
     Input (main)
     ======================================== */
  return (
    <main className="flex min-h-screen flex-col bg-background safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-16">
        {/* 顶部导航 */}
        <div className="mb-12 flex items-center justify-between">
          <span className="text-sm font-medium tracking-wider text-muted-foreground/60">
            DecideNow
          </span>
          <button
            onClick={() => window.location.href = "/history"}
            className="text-xs text-muted-foreground/40 hover:text-primary transition-colors"
          >
            我的档案
          </button>
        </div>

        {/* 主标题 */}
        <h1 className="mb-10 text-4xl font-extrabold leading-tight tracking-tight text-foreground">
          今天在纠结<br />什么？
        </h1>

        {/* 无边界输入框 */}
        <div className="relative mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="input-zen w-full resize-none text-lg leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (mode === "single") handleSingle();
                else handleMulti();
              }
            }}
          />
          {!input && (
            <span className="absolute right-4 top-4 h-5 w-0.5 animate-pulse bg-primary/40" />
          )}
        </div>

        {/* 快捷胶囊 */}
        {!input && (
          <div className="mb-8 flex flex-wrap gap-2 animate-float-up">
            {CAPSULES.map((c) => (
              <button
                key={c.label}
                onClick={() => handleCapsule(c.label)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-white/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-sm active:scale-95"
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 悬浮动作条 */}
        {input.trim().length >= 3 && (
          <div className="animate-float-up fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-3">
            <Button
              onClick={() => { setMode("single"); handleSingle(); }}
              size="lg"
              className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              帮我决定
            </Button>
            <Button
              onClick={() => { setMode("multi"); handleMulti(); }}
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-8 shadow-sm"
            >
              <Users className="h-4 w-4" />
              邀请朋友
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
