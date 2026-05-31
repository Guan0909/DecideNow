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

export function OptionCard({ option, index, total, onSelect, onPrev, onNext }: OptionCardProps) {
  const touchStart = useRef<{ x: number } | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      {index > 0 && (
        <button onClick={onPrev} className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2.5 shadow-sm border border-border/50 hover:shadow-md transition-all">
          <ChevronLeft className="h-5 w-5 text-foreground/60" />
        </button>
      )}
      {index < total - 1 && (
        <button onClick={onNext} className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2.5 shadow-sm border border-border/50 hover:shadow-md transition-all">
          <ChevronRight className="h-5 w-5 text-foreground/60" />
        </button>
      )}

      <div
        onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX }; setSwiping(true); }}
        onTouchMove={(e) => { if (touchStart.current) setSwipeX(e.touches[0].clientX - touchStart.current.x); }}
        onTouchEnd={() => {
          setSwiping(false);
          if (Math.abs(swipeX) > 60) {
            if (swipeX < 0 && index < total - 1) onNext();
            else if (swipeX > 0 && index > 0) onPrev();
          }
          setSwipeX(0);
        }}
        style={{
          transform: `translateX(${swipeX * 0.4}px) rotate(${swipeX * 0.01}deg)`,
          transition: swiping ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="card-premium overflow-hidden p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <span className="text-xs font-bold text-muted-foreground/40 tracking-widest">选项 {index + 1}/{total}</span>
            {index === 0 && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">最佳推荐</span>}
          </div>

          {/* Body */}
          <div className="px-6 pb-8">
            <h2 className="mb-3 text-2xl font-extrabold leading-tight text-foreground">{option.name}</h2>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground italic">&ldquo;{option.description}&rdquo;</p>

            {/* Score bars */}
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

            {/* Tags */}
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

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`rounded-full transition-all duration-300 ${i === index ? "h-2 w-6 bg-primary" : "h-2 w-2 bg-border"}`} />
        ))}
      </div>
    </div>
  );
}
