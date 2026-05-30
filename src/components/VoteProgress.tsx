"use client";

import { useEffect, useState } from "react";

interface VoteOption { id: string; name: string; description: string; voteCount: number; }
interface VoteProgressProps { options: VoteOption[]; totalVotes: number; selectedId: string | null; isClosed: boolean; winnerId?: string | null; }

export function VoteProgress({ options, totalVotes, selectedId, isClosed, winnerId }: VoteProgressProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, i) => {
        const pct = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
        const isWinner = isClosed && winnerId === option.id;
        const isSelected = selectedId === option.id;

        return (
          <div
            key={option.id}
            className="animate-float-up gpu relative overflow-hidden rounded-2xl border border-foreground/5 bg-white/60 backdrop-blur-sm transition-all duration-500"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-[1200ms] ease-out-expo ${
                isWinner ? "bg-amber-100/60" : "bg-primary/4"
              }`}
              style={{ width: animated ? `${Math.max(pct, 3)}%` : "0%" }}
            />
            <div className="relative flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-500 ${
                isWinner ? "bg-amber-100 text-amber-700 shadow-md shadow-amber-200/50" : "bg-foreground/[0.04] text-foreground/50"
              }`}>
                {isWinner ? "👑" : `${pct}%`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold tracking-tight truncate">{option.name}</span>
                  {isWinner && <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-700 border border-amber-200">🏆 胜出</span>}
                  {isSelected && !isClosed && <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">已投</span>}
                </div>
                <div className="mt-0.5 text-xs tracking-wide text-muted-foreground">{option.voteCount} 票 · {pct}%</div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="pt-1 text-center text-xs tracking-wider text-foreground/25">{totalVotes} 人参与</div>
    </div>
  );
}
