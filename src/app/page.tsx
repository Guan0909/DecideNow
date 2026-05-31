"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, MapPin, LogIn, Navigation } from "lucide-react";
import { OptionCard } from "@/components/OptionCard";
import { GENERATE_SYSTEM_PROMPT } from "@/lib/prompts";
import type { DecisionOption } from "@/lib/types";

type View = "input" | "loading" | "cards" | "result" | "error";

/* 基于时段和日期的智能标签推荐 */
function getTimeContext() {
  const now = new Date();
  const hour = now.getHours();
  // Weekend detection available for future use: now.getDay()

  if (hour >= 6 && hour < 10) {
    return { label: "☀️ 清晨灵感", tags: [
      { icon: "☕", label: "早起咖啡去哪" }, { icon: "🥐", label: "brunch推荐" }, { icon: "🏃", label: "晨跑路线" },
      { icon: "📚", label: "周末自习室" }, { icon: "🍳", label: "早餐吃什么" }, { icon: "🧘", label: "瑜伽馆推荐" },
    ]};
  }
  if (hour >= 10 && hour < 14) {
    return { label: "🕐 午间纠结", tags: [
      { icon: "🍜", label: "午餐吃什么" }, { icon: "🥗", label: "轻食沙拉" }, { icon: "🍱", label: "一人食推荐" },
      { icon: "💻", label: "共享办公" }, { icon: "🛒", label: "午休逛街" }, { icon: "☀️", label: "户外散步" },
    ]};
  }
  if (hour >= 14 && hour < 18) {
    return { label: "🌤 午后时光", tags: [
      { icon: "🍰", label: "下午茶去哪" }, { icon: "☕", label: "自习咖啡馆" }, { icon: "🎬", label: "今晚电影" },
      { icon: "💕", label: "约会晚餐" }, { icon: "🍸", label: "下班微醺" }, { icon: "🎂", label: "生日派对" },
    ]};
  }
  if (hour >= 18 && hour < 23) {
    return { label: "🌙 晚间消遣", tags: [
      { icon: "🍸", label: "周末微醺" }, { icon: "🍜", label: "深夜食堂" }, { icon: "🎬", label: "今晚看什么" },
      { icon: "🎤", label: "KTV唱歌" }, { icon: "🍻", label: "精酿酒吧" }, { icon: "🌃", label: "夜景打卡" },
    ]};
  }
  // 深夜 23-6
  return { label: "🌃 夜猫子推荐", tags: [
    { icon: "🍜", label: "深夜食堂" }, { icon: "🍸", label: "深夜酒吧" }, { icon: "🎮", label: "开黑去哪" },
    { icon: "🎬", label: "午夜电影" }, { icon: "🍲", label: "24h火锅" }, { icon: "🎵", label: "livehouse" },
  ]};
}

export default function Home() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("input");
  const [options, setOptions] = useState<DecisionOption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState("");

  const handleSubmit = useCallback(async () => {
    if (input.trim().length < 3) return;
    setView("loading");
    setErrorMsg("");
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer sk-c6544b31afef47a2b3d6a9cb0bcb3709" },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            { role: "system", content: GENERATE_SYSTEM_PROMPT },
            { role: "user", content: `用户需求：${input.trim()}${location ? `\n用户位置：${location}附近` : "\n用户未提供位置，请推荐通用热门选项"}\n\n请生成 3 个决策选项。` },
          ],
          temperature: 0.7, max_tokens: 800,
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

  const handleSelect = useCallback(() => {
    setSelectedIdx(currentIndex);
    setView("result");
  }, [currentIndex]);

  const handleJoinRoom = () => {
    if (joinCode.length >= 4) window.location.href = `/room/${joinCode}`;
  };

  const sel = view === "result" ? options[selectedIdx] : null;

  /* ---- Loading ---- */
  if (view === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
        <Sparkles className="h-10 w-10 animate-pulse text-primary" />
        <p className="text-lg font-semibold text-foreground">正在为你思考...</p>
        <p className="text-sm text-muted-foreground">AI 正在筛选最佳选项</p>
        <button onClick={() => setView("input")} className="text-xs text-muted-foreground/50 hover:text-primary mt-4">取消</button>
      </div>
    );
  }

  /* ---- Cards ---- */
  if (view === "cards" && options.length > 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background px-4 py-6 safe-top">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => { setView("input"); setInput(""); }} className="text-sm text-muted-foreground/60 hover:text-primary transition-colors">← 重新输入</button>
          <span className="text-xs font-medium tracking-widest text-muted-foreground/30">{currentIndex + 1}/{options.length}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center pb-12">
          <OptionCard option={options[currentIndex]} index={currentIndex} total={options.length}
            onSelect={handleSelect}
            onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex((i) => Math.min(options.length - 1, i + 1))} />
        </div>
        <p className="text-center text-xs text-muted-foreground/25">左右滑动切换</p>
      </div>
    );
  }

  /* ---- Result ---- */
  if (view === "result" && sel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center safe-top safe-bottom">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-pop">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/70">决定时刻</p>
        <h2 className="text-3xl font-extrabold text-foreground">{sel.name}</h2>
        <p className="text-sm text-muted-foreground max-w-xs italic">&ldquo;{sel.description}&rdquo;</p>

        {sel.priceHint && <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">💰 {sel.priceHint}</span>}
        {sel.locationHint && <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">📍 {sel.locationHint}</span>}

        <div className="flex gap-3 mt-2">
          {sel.locationHint && (
            <Button onClick={() => window.open(`https://uri.amap.com/search?keyword=${encodeURIComponent(sel.name)}`, "_blank")} size="lg">🧭 导航</Button>
          )}
          <Button onClick={async () => {
            const t = `🎯 DecideNow: ${sel.name} — ${sel.description}`;
            if (navigator.share) await navigator.share({ title: "我的决定", text: t }).catch(() => {});
            else { await navigator.clipboard.writeText(t); alert("已复制！"); }
          }} variant="outline" size="lg">📤 分享</Button>
          <Button onClick={() => { setView("input"); setInput(""); }} variant="ghost" size="lg">再来</Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground/20">DecideNow</p>
      </div>
    );
  }

  /* ---- Error ---- */
  if (view === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">暂时无法生成</p>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        <Button onClick={() => setView("input")} variant="outline">← 返回</Button>
      </div>
    );
  }

  /* ---- Input (Home) ---- */
  return (
    <main className="flex min-h-screen flex-col bg-background safe-top">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pt-12">

        {/* Header */}
        <div className="mb-14 flex items-center justify-between">
          <span className="text-xs font-bold tracking-[0.2em] text-foreground/30">DECIDENOW</span>
          <div className="flex items-center gap-3">
            {showJoin ? (
              <div className="flex items-center gap-1.5 animate-in">
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="分享码" maxLength={6}
                  className="w-28 rounded-lg border border-border bg-white px-3 py-2 text-xs font-mono tracking-widest placeholder:text-foreground/15 focus:outline-none focus:border-primary/40" />
                <button onClick={handleJoinRoom} disabled={joinCode.length < 4}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-30">进入</button>
                <button onClick={() => { setShowJoin(false); setJoinCode(""); }} className="text-foreground/20 hover:text-foreground/50 text-xs">✕</button>
              </div>
            ) : (
              <button onClick={() => setShowJoin(true)} className="text-xs text-foreground/30 hover:text-primary transition-colors flex items-center gap-1">
                <LogIn className="h-3 w-3" />加入
              </button>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-[2.5rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-foreground">
            今天<br />纠结什么？
          </h1>
        </div>

        {/* Location */}
        {location ? (
          <div className="mb-4 flex items-center gap-1.5 text-xs">
            <MapPin className="h-3 w-3 text-primary/60" />
            <span className="text-muted-foreground">{location} 附近</span>
            <button onClick={() => setLocation(null)} className="text-foreground/15 hover:text-foreground/40 text-[10px]">✕</button>
          </div>
        ) : (
          <div className="mb-4 animate-in">
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-foreground/10 px-3 py-2.5">
              <Navigation className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="添加位置，推荐更精准"
                className="flex-1 bg-transparent text-xs text-foreground/70 placeholder:text-foreground/25 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && locationInput.trim()) {
                    setLocation(locationInput.trim());
                    setLocationInput("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (locationInput.trim()) { setLocation(locationInput.trim()); setLocationInput(""); return; }
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&zoom=12&accept-language=zh`, { headers: { "User-Agent": "DecideNow/1.0" } });
                          if (res.ok) { const data = await res.json(); const d = data.address || {}; setLocation(d.city_district || d.suburb || d.county || d.city || ""); }
                        } catch { setLocation("当前位置"); }
                      },
                      () => {},
                      { timeout: 8000 }
                    );
                  }
                }}
                className="shrink-0 rounded-lg bg-foreground/5 px-2.5 py-1.5 text-[10px] font-medium text-foreground/40 hover:text-foreground/60 hover:bg-foreground/8 transition-colors"
              >
                📍
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="比如：三个人，人均100，徐家汇吃辣..."
          rows={3}
          className="input-premium mb-4 resize-none leading-relaxed"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />

        {/* Submit buttons */}
        {input.trim().length >= 3 && (
          <div className="flex gap-3 animate-in pb-8">
            <Button onClick={handleSubmit} size="lg" className="flex-1 gap-2 rounded-xl text-[15px] font-semibold shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4" /> 帮我决定
            </Button>
            <Button onClick={() => { sessionStorage.setItem("decidenow_room_title", input.trim()); window.location.href = "/room/create"; }}
              variant="outline" size="lg" className="flex-1 gap-2 rounded-xl text-[15px]">
              <Users className="h-4 w-4" /> 邀请朋友
            </Button>
          </div>
        )}

        {/* Capsules — 基于时段智能推荐 */}
        {!input && (
          <div className="animate-in">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/20">
              {getTimeContext().label}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {getTimeContext().tags.map((c) => (
                <button key={c.label} onClick={() => setInput(c.label)}
                  className="card-premium flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                  <span className="text-base">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
