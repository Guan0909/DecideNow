"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreCard } from "@/components/ScoreCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  DollarSign,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { DecisionOption } from "@/lib/types";

interface OptionCardProps {
  option: DecisionOption;
  index: number;
  total: number;
  onSelect: () => void;
  onPrev: () => void;
  onNext: () => void;
  isSelected: boolean;
}

export function OptionCard({
  option,
  index,
  total,
  onSelect,
  onPrev,
  onNext,
  isSelected,
}: OptionCardProps) {
  const touchStartX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setOffsetX(diff * 0.5); // 阻尼
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (offsetX < -60) {
      onNext();
    } else if (offsetX > 60) {
      onPrev();
    }
    setOffsetX(0);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* 导航按钮 */}
      {index > 0 && (
        <button
          onClick={onPrev}
          className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg shadow-black/10 transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      {index < total - 1 && (
        <button
          onClick={onNext}
          className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg shadow-black/10 transition-all hover:scale-110 active:scale-95"
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
          transform: `translateX(${offsetX}px) rotate(${offsetX * 0.02}deg)`,
          transition: swiping ? "none" : "transform 0.3s ease-out",
        }}
      >
        <Card
          className={`overflow-hidden transition-all duration-300 ${
            isSelected
              ? "ring-2 ring-primary shadow-xl shadow-primary/20"
              : "hover:shadow-lg"
          }`}
        >
          {/* 排名角标 */}
          <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md">
            {index + 1}
          </div>

          {/* 推荐标签 */}
          {index === 0 && (
            <div className="absolute right-4 top-4">
              <Badge className="gap-1 bg-amber-400 text-amber-900 hover:bg-amber-400">
                <ThumbsUp className="h-3 w-3" />
                最佳推荐
              </Badge>
            </div>
          )}

          <CardContent className="p-6 pt-14">
            {/* 选项名 */}
            <h2 className="mb-2 text-xl font-bold text-foreground">
              {option.name}
            </h2>

            {/* AI 推荐语 */}
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {option.description}
            </p>

            {/* 评分 */}
            {option.scoreCard && (
              <div className="mb-4 rounded-xl bg-muted/50 p-3">
                <ScoreCard scoreCard={option.scoreCard} />
              </div>
            )}

            {/* 信息标签 */}
            <div className="mb-5 flex flex-wrap gap-2">
              {option.priceHint && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  {option.priceHint}
                </Badge>
              )}
              {option.locationHint && (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {option.locationHint}
                </Badge>
              )}
            </div>

            {/* 选择按钮 */}
            <Button
              onClick={onSelect}
              size="lg"
              className="w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.98]"
            >
              就它了！
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 页码指示器 */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < index) onPrev();
              if (i > index) onNext();
            }}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
