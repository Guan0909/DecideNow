"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { DecisionOption } from "@/lib/types";

interface OptionCardProps {
  option: DecisionOption;
  index: number;
  total: number;
  onSelect: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function OptionCard({ option, index, total, onSelect, onPrev, onNext }: OptionCardProps) {
  const touchStart = useRef<{ x: number; t: number } | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, t: Date.now() };
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const diff = e.touches[0].clientX - touchStart.current.x;
    setSwipeX(diff);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    if (!touchStart.current) return;
    const velocity = swipeX / Math.max(Date.now() - touchStart.current.t, 1);
    const absX = Math.abs(swipeX);
    // 滑动超过 30% 宽度 或 快速轻扫
    const threshold = window.innerWidth * 0.3;
    if (absX > threshold || (absX > 40 && Math.abs(velocity) > 0.4)) {
      if (swipeX < 0 && index < total - 1) onNext();
      else if (swipeX > 0 && index > 0) onPrev();
    }
    setSwipeX(0);
    touchStart.current = null;
  }, [swipeX, index, total, onNext, onPrev]);

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      {/* 卡片堆叠效果（背景虚影） */}
      {!swiping && index < total - 1 && (
        <div className="absolute inset-x-2 -bottom-2 top-2 rounded-2xl bg-card/40 border border-border/30 -z-10" />
      )}
      {!swiping && index < total - 2 && (
        <div className="absolute inset-x-4 -bottom-4 top-4 rounded-2xl bg-card/20 border border-border/20 -z-20" />
      )}

      {/* 左右箭头 */}
      {index > 0 && (
        <button onClick={onPrev} className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md border border-border/30 hover:shadow-lg hover:scale-110 transition-all duration-200 backdrop-blur-sm">
          <ChevronLeft className="h-5 w-5 text-foreground/50" />
        </button>
      )}
      {index < total - 1 && (
        <button onClick={onNext} className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md border border-border/30 hover:shadow-lg hover:scale-110 transition-all duration-200 backdrop-blur-sm">
          <ChevronRight className="h-5 w-5 text-foreground/50" />
        </button>
      )}

      {/* 主卡片 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: swiping
            ? `translateX(${swipeX}px) rotate(${swipeX * 0.02}deg) scale(${1 - Math.abs(swipeX) / 3000})`
            : "translateX(0) rotate(0deg) scale(1)",
          opacity: swiping ? 1 - Math.abs(swipeX) / 800 : 1,
          transition: swiping ? "none" : "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease",
        }}
      >
        <div className="card-premium overflow-hidden p-0">
          {/* 进度条 */}
          <div className="h-1 w-full bg-border/50">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <span className="text-xs font-bold text-muted-foreground/40 tracking-widest">{index + 1}/{total}</span>
            {index === 0 && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">最佳推荐</span>}
          </div>

          {/* Body */}
          <div className="px-6 pb-8">
            <h2 className="mb-3 text-2xl font-extrabold leading-tight text-foreground">{option.name}</h2>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground italic">&ldquo;{option.description}&rdquo;</p>

            {option.scoreCard && (
              <div className="mb-5 space-y-2.5 rounded-xl bg-muted/50 p-4">
                {[
                  { label: "口味", key: "taste" as const },
                  { label: "氛围", key: "ambiance" as const },
                  { label: "预算", key: "budget" as const },
                ].map(({ label, key }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-medium text-muted-foreground">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${(option.scoreCard[key] / 5) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs font-semibold tabular-nums text-foreground/60">{option.scoreCard[key]}/5</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              {option.priceHint && <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">💰 {option.priceHint}</span>}
              {option.locationHint && <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">📍 {option.locationHint}</span>}
            </div>

            <Button onClick={onSelect} size="lg" className="w-full gap-2">
              就它了 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 圆点指示器 */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < index) onPrev();
              else if (i > index) onNext();
            }}
            className={`rounded-full transition-all duration-300 ${
              i === index ? "h-2.5 w-7 bg-primary shadow-sm shadow-primary/30" : "h-2.5 w-2.5 bg-border hover:bg-primary/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
