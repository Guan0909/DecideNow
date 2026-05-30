"use client";

import { useState, useRef } from "react";
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

export function OptionCard({
  option,
  index,
  total,
  onSelect,
  onPrev,
  onNext,
}: OptionCardProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setSwiping(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    setSwipeX(e.touches[0].clientX - touchStart.current.x);
  };
  const handleTouchEnd = () => {
    setSwiping(false);
    if (Math.abs(swipeX) > 80) {
      if (swipeX < 0 && index < total - 1) onNext();
      else if (swipeX > 0 && index > 0) onPrev();
    }
    setSwipeX(0);
    touchStart.current = null;
  };

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      {/* 导航箭头 */}
      {index > 0 && (
        <button
          onClick={onPrev}
          className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      {index < total - 1 && (
        <button
          onClick={onNext}
          className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* 卡片 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeX * 0.4}px) rotate(${swipeX * 0.015}deg) translateZ(0)`,
          transition: swiping ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          willChange: swiping ? "transform" : "auto",
        }}
      >
        <div className="glass rounded-3xl overflow-hidden">
          {/* 排名角标 */}
          <div className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl bg-foreground/[0.04] text-xs font-bold text-foreground/35">
            {index + 1}
          </div>

          <div className="p-8 pt-14">
            {/* 推荐标签 */}
            {index === 0 && (
              <div className="mb-4 flex justify-center">
                <span className="rounded-full bg-primary/8 px-4 py-1 text-[11px] font-semibold tracking-wider text-primary border border-primary/10">
                  ✦ 最佳推荐
                </span>
              </div>
            )}
            {/* 第一层：情感定调 */}
            <h2 className="mb-4 text-center text-3xl font-extrabold leading-[1.2] tracking-[-0.01em] text-foreground">
              {option.name}
            </h2>
            <p className="mb-7 text-center text-[13px] italic leading-relaxed text-muted-foreground/70">
              &ldquo;{option.description}&rdquo;
            </p>

            {/* 第二层：理性校验 */}
            {option.scoreCard && (
              <div className="mb-6 space-y-2.5 rounded-2xl bg-foreground/[0.02] p-5">
                {[
                  { label: "口味匹配", key: "taste" as const },
                  { label: "氛围匹配", key: "ambiance" as const },
                  { label: "预算友好", key: "budget" as const },
                ].map(({ label, key }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-[11px] font-medium tracking-wide text-muted-foreground">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-[800ms] ease-out-expo"
                        style={{ width: `${(option.scoreCard![key] / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] font-semibold tabular-nums text-foreground/60">{option.scoreCard![key]}/5</span>
                  </div>
                ))}
              </div>
            )}

            {/* 标签组 */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {option.priceHint && (
                <span className="rounded-full border border-foreground/6 bg-white/50 px-3 py-1.5 text-[11px] tracking-wide text-muted-foreground backdrop-blur-sm">
                  💰 {option.priceHint}
                </span>
              )}
              {option.locationHint && (
                <span className="rounded-full border border-foreground/6 bg-white/50 px-3 py-1.5 text-[11px] tracking-wide text-muted-foreground backdrop-blur-sm">
                  📍 {option.locationHint}
                </span>
              )}
            </div>

            {/* 第三层：行动转化 */}
            <Button onClick={onSelect} size="lg" className="w-full gap-2 rounded-2xl text-[15px] tracking-wide">
              就它了 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 页码 */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < index && index > 0) onPrev();
              if (i > index && index < total - 1) onNext();
            }}
            className={`rounded-full transition-all duration-300 ${
              i === index ? "h-2 w-6 bg-primary" : "h-2 w-2 bg-muted-foreground/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
