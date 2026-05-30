"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Users,
  User,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

interface DecisionItem {
  id: string;
  title: string;
  mode: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
  selectedId: string | null;
  options: Array<{
    id: string;
    name: string;
    description: string;
    priceHint: string | null;
    locationHint: string | null;
  }>;
}

const SCENE_TAGS = ["美食", "出游", "娱乐", "购物", "健身", "其他"] as const;

function detectScene(title: string): string {
  const map: Record<string, string> = {
    吃: "美食", 饭: "美食", 餐: "美食", 美食: "美食", 辣: "美食",
    咖啡: "美食", 甜品: "美食", 火锅: "美食", 烧烤: "美食",
    玩: "出游", 游: "出游", 旅行: "出游", 户外: "出游", 露营: "出游",
    电影: "娱乐", KTV: "娱乐", 密室: "娱乐", 游戏: "娱乐",
    买: "购物", 购物: "购物", 逛街: "购物",
    健身: "健身", 运动: "健身", 跑步: "健身", 瑜伽: "健身",
  };
  for (const [key, tag] of Object.entries(map)) {
    if (title.includes(key)) return tag;
  }
  return "其他";
}

interface HistoryListProps {
  decisions: DecisionItem[];
}

export function HistoryList({ decisions }: HistoryListProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? decisions.filter((d) => detectScene(d.title) === activeTag)
    : decisions;

  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="text-6xl">📭</div>
        <p className="text-lg font-medium text-foreground">还没有决定记录</p>
        <p className="text-sm text-muted-foreground">
          完成一个决定后，它会出现在这里
        </p>
        <Link href="/">
          <Button className="gap-2 rounded-2xl">去做个决定</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 标签筛选 */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            !activeTag
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          全部
        </button>
        {SCENE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              tag === activeTag
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="flex flex-col gap-3">
        {filtered.map((decision) => {
          const scene = detectScene(decision.title);
          const selectedOption = decision.options.find(
            (o) => o.id === decision.selectedId
          );
          const isCompleted = decision.status === "COMPLETED";

          return (
            <Link
              key={decision.id}
              href={
                isCompleted
                  ? `/decide/${decision.id}/card`
                  : `/room/${decision.id}`
              }
            >
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:shadow-primary/5">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* 状态图标 */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isCompleted ? "bg-green-100" : "bg-amber-100"
                    }`}
                  >
                    {decision.mode === "MULTI" ? (
                      <Users
                        className={`h-5 w-5 ${isCompleted ? "text-green-500" : "text-amber-500"}`}
                      />
                    ) : (
                      <User
                        className={`h-5 w-5 ${isCompleted ? "text-green-500" : "text-amber-500"}`}
                      />
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {decision.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        {scene}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(decision.createdAt).toLocaleDateString(
                          "zh-CN"
                        )}
                      </span>
                      {selectedOption && (
                        <>
                          {selectedOption.priceHint && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {selectedOption.priceHint}
                            </span>
                          )}
                          {selectedOption.locationHint && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedOption.locationHint}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {selectedOption && (
                      <p className="mt-0.5 text-xs font-medium text-primary">
                        选了：{selectedOption.name}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
