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

export function VoteProgress({
  options,
  totalVotes,
  selectedId,
  isClosed,
  winnerId,
}: VoteProgressProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // 延迟触发动画
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxVotes = Math.max(...options.map((o) => o.voteCount), 1);

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const percentage = totalVotes > 0
          ? Math.round((option.voteCount / totalVotes) * 100)
          : 0;
        const barWidth = animated
          ? `${Math.max((option.voteCount / maxVotes) * 100, 2)}%`
          : "0%";
        const isWinner = isClosed && winnerId === option.id;
        const isSelected = selectedId === option.id;

        return (
          <div
            key={option.id}
            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
              isWinner
                ? "border-amber-400 bg-amber-50 shadow-lg"
                : isSelected
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-white"
            }`}
          >
            {/* 进度条背景 */}
            <div
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                isWinner ? "bg-amber-100/50" : "bg-primary/5"
              }`}
              style={{ width: barWidth }}
            />

            {/* 内容 */}
            <div className="relative flex items-center gap-4 p-4">
              {/* 排名 */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isWinner
                    ? "bg-amber-400 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isWinner ? "👑" : percentage + "%"}
              </div>

              {/* 选项信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate">
                    {option.name}
                  </span>
                  {isWinner && (
                    <span className="shrink-0 text-xs font-bold text-amber-500">
                      🏆 胜出
                    </span>
                  )}
                  {isSelected && !isClosed && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                      已投
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {option.voteCount} 票 · {percentage}%
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 总票数 */}
      <div className="text-center text-xs text-muted-foreground">
        共 {totalVotes} 人参与投票
      </div>
    </div>
  );
}
