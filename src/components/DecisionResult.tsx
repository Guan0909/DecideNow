"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreCard } from "@/components/ScoreCard";
import {
  Share2,
  MapPin,
  Navigation,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface ResultData {
  id: string;
  title: string;
  status: string;
  completedAt: string;
  options: {
    id: string;
    name: string;
    description: string;
    priceHint: string | null;
    locationHint: string | null;
    scoreCard: string | null;
  }[];
  selectedId: string | null;
}

interface DecisionResultProps {
  decision: ResultData;
  selectedIndex: number;
}

export function DecisionResult({ decision, selectedIndex }: DecisionResultProps) {
  const selectedOption = decision.options[selectedIndex];

  if (!selectedOption) return null;

  const scoreCard = selectedOption.scoreCard
    ? JSON.parse(selectedOption.scoreCard)
    : null;

  const handleShare = async () => {
    const text = `🎯 DecideNow 帮我做了决定！\n\n选择：${selectedOption.name}\n理由：${selectedOption.description}\n\n你也来试试 →`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "我的决定", text, url });
      } catch {
        // 用户取消分享
      }
    } else {
      // 降级为复制链接
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert("已复制分享内容到剪贴板 📋");
    }
  };

  const handleNavigate = () => {
    if (selectedOption.locationHint) {
      window.open(
        `https://uri.amap.com/search?keyword=${encodeURIComponent(selectedOption.name)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 结果头部 */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-foreground">决定已做出！</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(decision.completedAt).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* 选中选项卡片 */}
      <Card className="overflow-hidden border-2 border-primary shadow-xl shadow-primary/20">
        <CardContent className="p-6">
          <Badge className="mb-3 gap-1 bg-primary text-primary-foreground">
            <CheckCircle2 className="h-3 w-3" />
            最终选择
          </Badge>

          <h2 className="mb-2 text-xl font-bold">{selectedOption.name}</h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {selectedOption.description}
          </p>

          {scoreCard && (
            <div className="mb-4 rounded-xl bg-muted/50 p-3">
              <ScoreCard scoreCard={scoreCard} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {selectedOption.priceHint && (
              <Badge variant="secondary">{selectedOption.priceHint}</Badge>
            )}
            {selectedOption.locationHint && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {selectedOption.locationHint}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleNavigate}
          size="lg"
          className="w-full gap-2 rounded-2xl text-base font-semibold"
        >
          <Navigation className="h-5 w-5" />
          导航去这里
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="flex-1 gap-2 rounded-2xl"
          >
            <Share2 className="h-4 w-4" />
            分享
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="ghost"
            size="lg"
            className="flex-1 gap-2 rounded-2xl"
          >
            <RotateCcw className="h-4 w-4" />
            再来一次
          </Button>
        </div>
      </div>

      {/* 原始需求 */}
      <div className="rounded-xl bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">原始需求</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {decision.title}
        </p>
      </div>
    </div>
  );
}
