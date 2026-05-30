"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DecisionResult } from "@/components/DecisionResult";
import { Loader2, AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DecisionData {
  id: string;
  title: string;
  status: string;
  completedAt: string;
  selectedId: string | null;
  options: Array<{
    id: string;
    name: string;
    description: string;
    priceHint: string | null;
    locationHint: string | null;
    scoreCard: string | null;
  }>;
}

export default function DecisionCardPage() {
  const params = useParams();
  const [decision, setDecision] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDecision() {
      try {
        const res = await fetch(`/api/decisions/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("决定不存在");
          throw new Error("加载失败");
        }
        const data: DecisionData = await res.json();
        setDecision(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    }
    fetchDecision();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error || "决定不存在"}</p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            返回首页
          </Button>
        </Link>
      </div>
    );
  }

  const selectedIndex = decision.selectedId
    ? decision.options.findIndex((o) => o.id === decision.selectedId)
    : 0;

  return (
    <div className="mx-auto max-w-lg px-5 py-8 safe-top safe-bottom">
      <DecisionResult
        decision={decision}
        selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
      />

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          由 <span className="font-semibold text-primary">DecideNow</span>{" "}
          生成 · 让每一个纠结都有答案
        </p>
      </div>
    </div>
  );
}
