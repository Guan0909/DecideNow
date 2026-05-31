"use client";

import { useEffect, useState } from "react";

interface VoteOption { id: string; name: string; description: string; voteCount: number; }
interface VoteProgressProps {
  options: VoteOption[];
  totalVotes: number;
  selectedId: string | null;
  isClosed: boolean;
  winnerId?: string | null;
  onSelect?: (id: string) => void;
}

export function VoteProgress({ options, totalVotes, selectedId, isClosed, winnerId, onSelect }: VoteProgressProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, i) => {
        const pct = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
        const isWinner = isClosed && winnerId === option.id;
        const isSelected = selectedId === option.id;
        const clickable = !isClosed && onSelect;

        return (
          <button
            key={option.id}
            onClick={() => clickable && onSelect(option.id)}
            disabled={!clickable}
            className={`animate-float-up gpu relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 ${
              isWinner
                ? "border-amber-400 bg-amber-50/80"
                : isSelected
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : clickable
                ? "border-border bg-card hover:border-primary/30 hover:shadow-sm cursor-pointer"
                : "border-border bg-card"
            }`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* 进度填充 */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-[1200ms] ease-out-expo ${
                isWinner ? "bg-amber-100/60" : "bg-primary/4"
              }`}
              style={{ width: animated ? `${Math.max(pct, 3)}%` : "0%" }}
            />

            <div className="relative flex items-center gap-4 p-5">
              {/* 左侧：排名/百分比 */}
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-500 ${
                isWinner ? "bg-amber-100 text-amber-700 shadow-md" : isSelected ? "bg-primary text-white shadow-md" : "bg-foreground/[0.06] text-foreground/65"
              }`}>
                {isWinner ? "👑" : isSelected ? "✓" : `${pct}%`}
              </div>

              {/* 中间：选项名 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold tracking-tight truncate text-foreground">{option.name}</span>
                  {isWinner && <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-700 border border-amber-200">🏆 胜出</span>}
                  {isSelected && !isClosed && <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">已选</span>}
                </div>
                <div className="mt-0.5 text-xs tracking-wide text-muted-foreground">{option.voteCount} 票 · {pct}%</div>
              </div>

              {/* 右侧：投票提示 */}
              {clickable && !isSelected && (
                <span className="shrink-0 text-xs text-muted-foreground/50">点击投票</span>
              )}
            </div>
          </button>
        );
      })}
      <div className="pt-1 text-center text-xs tracking-wider text-foreground/25">{totalVotes} 人参与</div>
    </div>
  );
}
