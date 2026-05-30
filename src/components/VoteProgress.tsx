"use client";

import { useEffect, useState } from "react";

interface VoteOption {
  id: string;
  name: string;
  description: string;
  voteCount: number;
}

interface VoteProgressProps {
  options: VoteOption[];
  totalVotes: number;
  selectedId: string | null;
  isClosed: boolean;
  winnerId?: string | null;
}

export function VoteProgress({ options, totalVotes, selectedId, isClosed, winnerId }: VoteProgressProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const pct = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
        const isWinner = isClosed && winnerId === option.id;
        const isSelected = selectedId === option.id;

        return (
          <div
            key={option.id}
            className="relative overflow-hidden rounded-2xl border border-border/20 bg-white/60 backdrop-blur-sm transition-all duration-500"
          >
            {/* 从左到右填充 */}
            <div
              className={`absolute inset-0 transition-all duration-1000 ease-out rounded-2xl ${
                isWinner ? "bg-primary/10" : "bg-primary/5"
              }`}
              style={{ width: animated ? `${Math.max(pct, 2)}%` : "0%" }}
            />

            <div className="relative flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
                isWinner ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {isWinner ? "👑" : `${pct}%`}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate">{option.name}</span>
                  {isWinner && <span className="shrink-0 text-xs font-bold text-primary">🏆 胜出</span>}
                  {isSelected && !isClosed && <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">已投</span>}
                </div>
                <div className="text-xs text-muted-foreground">{option.voteCount} 票 · {pct}%</div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="text-center text-xs text-muted-foreground/60">共 {totalVotes} 人参与</div>
    </div>
  );
}
