"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Users,
  CheckCircle2,
  Share2,
  RotateCcw,
  Navigation,
  MapPin,
  LogIn,
  X,
} from "lucide-react";
import type { DecisionOption } from "@/lib/types";
import { GENERATE_SYSTEM_PROMPT } from "@/lib/prompts";
import { OptionCard } from "@/components/OptionCard";

interface ResultOption {
  id: string;
  name: string;
  description: string;
  priceHint: string | null;
  locationHint: string | null;
  scoreCard: string | null;
}
interface ResultData {
  title: string;
  completedAt: string;
  options: ResultOption[];
  selectedId: string;
}

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
  { label: "健身私教推荐", icon: "💪" },
  { label: "周末brunch", icon: "🥐" },
  { label: "深夜食堂", icon: "🍜" },
  { label: "露营装备清单", icon: "⛺" },
  { label: "自习咖啡馆", icon: "☕" },
  { label: "生日派对策划", icon: "🎂" },
  { label: "遛娃好去处", icon: "👶" },
  { label: "一人食推荐", icon: "🍱" },
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
  const [decisionData, setDecisionData] = useState<ResultData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [location, setLocation] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const placeholder = useTypewriter([
    "告诉 AI 你的想法，或输入选项...",
    "比如：三个人，人均80，吃辣的...",
    "比如：周末去哪玩？户外自驾...",
  ]);

  // 获取位置
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=67c4a2b0e290a444558749bof6c1f09`
          );
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.county || "";
            const district = data.address?.suburb || data.address?.city_district || "";
            setLocation(district || city || null);
          }
        } catch { /* 定位失败不影响使用 */ }
      },
      () => { /* 用户拒绝定位 */ },
      { timeout: 5000, enableHighAccuracy: false }
    );
  }, []);

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
          model: "deepseek-v4-flash",
          messages: [
            { role: "system", content: GENERATE_SYSTEM_PROMPT },
            { role: "user", content: `用户需求：${input.trim()}${location ? `\n用户当前位置：${location}` : ""}\n\n请根据用户位置推荐附近真实地点，生成 3 个决策选项。` },
          ],
          temperature: 0.7,
          max_tokens: 800,
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
    sessionStorage.setItem("decidenow_room_title", input.trim());
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-8"
        style={{ background: "linear-gradient(175deg, #F6F3ED 0%, #EFEBE3 35%, #F8F5F0 100%)" }}>
        {/* 呼吸光环 */}
        <div className="animate-breathe relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" style={{ width: 120, height: 120, left: -20, top: -20 }} />
          <Sparkles className="relative z-10 mx-auto h-14 w-14 text-primary" />
        </div>

        <p className="text-xl font-bold text-foreground">正在为你思考...</p>

        {/* 步骤条 */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          {[
            { icon: "🔍", label: "解析你的需求", detail: "理解约束条件" },
            { icon: "🤖", label: "AI 匹配检索", detail: "筛选最佳选项" },
            { icon: "✨", label: "生成推荐结果", detail: "撰写个性化评语" },
          ].map((step, i) => (
            <div
              key={step.label}
              className="animate-float-up flex items-center gap-4 rounded-2xl bg-white/60 backdrop-blur-sm px-5 py-3.5 border border-foreground/5 shadow-sm"
              style={{ animationDelay: `${i * 0.25}s` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04] text-xl">
                {step.icon}
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
              {i < 2 && (
                <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ========================================
     Cards — Tinder 式画廊
     ======================================== */
  if (view === "cards" && options.length > 0) {
    return (
      <div className="animate-page-in flex min-h-screen flex-col px-5 py-8 safe-top"
        style={{ background: "linear-gradient(175deg, #F6F3ED 0%, #EFEBE3 35%, #F8F5F0 100%)" }}>
        {/* 顶部 */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => { setView("input"); setInput(""); }}
            className="text-xs text-foreground/35 hover:text-primary transition-colors duration-300"
          >
            ← 重新输入
          </button>
          <span className="text-xs font-medium uppercase tracking-widest text-foreground/20">
            {currentIndex + 1} / {options.length}
          </span>
        </div>

        {/* 卡片 */}
        <div className="flex flex-1 flex-col items-center justify-center pb-20">
          <div className="animate-card-in w-full">
            <OptionCard
              option={options[currentIndex]}
              index={currentIndex}
              total={options.length}
              onSelect={handleSelect}
              onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIndex((i) => Math.min(options.length - 1, i + 1))}
            />
          </div>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-foreground/15">
          左右滑动切换选项
        </p>
      </div>
    );
  }

  /* ========================================
     Result — 结算高光动画
     ======================================== */
  if (view === "result" && decisionData) {
    const sel = decisionData.options[selectedIndex];
    const others = decisionData.options.filter((_, i) => i !== selectedIndex);

    return (
      <div className="animate-page-in flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center safe-top safe-bottom overflow-hidden">
        {/* 阶段 1: 高光扫过 */}
        <div className="animate-glow-sweep absolute inset-0" />

        {/* 阶段 2: 胜出者放大+光晕 */}
        <div className="animate-stage-win relative z-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* 阶段 3: 印章盖下 */}
        <p className="animate-stamp relative z-10 text-lg font-black uppercase tracking-[0.4em]"
           style={{ color: "#B8935A", transform: "rotate(-5deg)" }}>
          决定时刻
        </p>

        <h2 className="animate-float-up relative z-10 text-4xl font-extrabold leading-tight text-foreground">
          {sel.name}
        </h2>
        <p className="animate-float-up relative z-10 text-base italic leading-relaxed text-muted-foreground max-w-xs">
          &ldquo;{sel.description}&rdquo;
        </p>

        {/* 阶段 4: 失败者褪色 */}
        {others.length > 0 && (
          <div className="animate-stage-fade flex flex-wrap justify-center gap-3">
            {others.map((o, i) => (
              <span key={i} className="text-xs text-muted-foreground line-through">
                {o.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 relative z-10">
          {sel.priceHint && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">💰 {sel.priceHint}</span>
          )}
          {sel.locationHint && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">📍 {sel.locationHint}</span>
          )}
        </div>

        <div className="flex gap-3 mt-2 relative z-10">
          {sel.locationHint && (
            <Button onClick={() => window.open(`https://uri.amap.com/search?keyword=${encodeURIComponent(sel.name)}`, "_blank")} size="lg" className="gap-2 rounded-2xl">
              <Navigation className="h-4 w-4" /> 导航
            </Button>
          )}
          <Button
            onClick={async () => {
              const text = `🎯 DecideNow 帮我做了决定！\n${sel.name}\n${sel.description}`;
              if (navigator.share) await navigator.share({ title: "我的决定", text }).catch(() => {});
              else { await navigator.clipboard.writeText(text); alert("已复制分享内容 📋"); }
            }}
            variant="outline" size="lg" className="gap-2 rounded-2xl">
            <Share2 className="h-4 w-4" /> 分享
          </Button>
          <Button onClick={() => { setView("input"); setInput(""); }} variant="ghost" size="lg" className="gap-2 rounded-2xl">
            <RotateCcw className="h-4 w-4" /> 再来
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground/25 relative z-10">
          由 <span className="font-semibold text-primary">DecideNow</span> 生成
        </p>
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
    <main className="flex min-h-screen flex-col safe-top safe-bottom"
      style={{
        background: "linear-gradient(175deg, #F6F3ED 0%, #EFEBE3 35%, #F8F5F0 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-16">
        {/* 顶部导航 */}
        <div className="mb-12 flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.15em] text-foreground/50">
            DECIDENOW
          </span>
          <div className="flex items-center gap-3">
            {!showJoin ? (
              <button
                onClick={() => setShowJoin(true)}
                className="text-xs font-medium text-foreground/35 hover:text-primary transition-colors flex items-center gap-1"
              >
                <LogIn className="h-3 w-3" />
                加入投票
              </button>
            ) : (
              <div className="flex items-center gap-1.5 animate-float-up">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="输入 6 位分享码"
                  maxLength={6}
                  className="w-32 rounded-xl border border-foreground/10 bg-white/60 px-3 py-1.5 text-xs font-mono tracking-widest placeholder:text-foreground/20 focus:outline-none focus:border-primary/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && joinCode.length >= 4) {
                      window.location.href = `/room/${joinCode}`;
                    }
                  }}
                />
                <button
                  onClick={() => { if (joinCode.length >= 4) window.location.href = `/room/${joinCode}`; }}
                  disabled={joinCode.length < 4}
                  className="rounded-lg bg-primary px-2.5 py-1.5 text-[10px] font-bold text-white disabled:opacity-30 transition-all hover:brightness-110"
                >
                  进入
                </button>
                <button onClick={() => { setShowJoin(false); setJoinCode(""); }} className="text-foreground/20 hover:text-foreground/50">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={() => window.location.href = "/history"}
              className="text-xs font-medium text-foreground/35 hover:text-primary transition-colors"
            >
              我的档案
            </button>
          </div>
        </div>

        {/* 主标题 */}
        <h1 className="mb-10 text-[2.75rem] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
          今天在纠结<br />什么？
        </h1>

        {/* 位置标签 */}
        {location && (
          <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60">
            <MapPin className="h-3 w-3" />
            <span>基于你在 <strong className="text-foreground/70">{location}</strong> 附近推荐</span>
          </div>
        )}

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

        {/* 快捷胶囊 —— 交错入场 */}
        {!input && (
          <div className="mb-8 grid animate-float-up stagger grid-cols-2 gap-2">
            {CAPSULES.map((c) => (
              <button
                key={c.label}
                onClick={() => handleCapsule(c.label)}
                className="gpu flex items-center gap-2 rounded-2xl border border-foreground/6 bg-white/60 px-4 py-3 text-sm font-medium text-foreground/65 backdrop-blur-sm transition-all duration-300 ease-out-expo hover:border-primary/30 hover:text-primary hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <span className="text-lg">{c.icon}</span>
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 悬浮动作条 —— 弹簧滑入 */}
        {input.trim().length >= 3 && (
          <div className="animate-slide-up fixed inset-x-0 bottom-8 z-50 flex justify-center gap-3 px-6">
            <Button
              onClick={() => { setMode("single"); handleSingle(); }}
              size="lg"
              className="gpu gap-2 rounded-full px-8 shadow-lg shadow-primary/20 transition-all duration-300 ease-out-expo hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              帮我决定
            </Button>
            <Button
              onClick={() => { setMode("multi"); handleMulti(); }}
              variant="outline"
              size="lg"
              className="gpu gap-2 rounded-full px-8 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out-expo hover:shadow-md hover:-translate-y-1 active:scale-95"
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
