"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VoteProgress } from "@/components/VoteProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, Share2, RotateCcw, Trophy } from "lucide-react";

interface ResultData {
  shareCode: string;
  isAnonymous: boolean;
  decision: {
    id: string;
    title: string;
    status: string;
    options: Array<{
      id: string;
      name: string;
      description: string;
      voteCount: number;
    }>;
  };
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/rooms/${params.code}`);
        if (!res.ok) throw new Error("加载失败");
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.code]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error || "加载失败"}</p>
        <Button onClick={() => router.push("/")} variant="outline">
          返回首页
        </Button>
      </div>
    );
  }

  const totalVotes = data.decision.options.reduce(
    (sum, o) => sum + o.voteCount,
    0
  );
  const winner = data.decision.options.reduce((a, b) =>
    a.voteCount >= b.voteCount ? a : b
  );

  const handleShare = async () => {
    const text = `🏆 投票结果出炉！\n\n"${data.decision.title}"\n👑 胜出：${winner.name}（${winner.voteCount} 票）\n\n由 DecideNow 生成`;
    const url = window.location.href.replace("/result", "");

    if (navigator.share) {
      await navigator.share({ title: "投票结果", text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("结果已复制！");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-5 py-8 safe-top safe-bottom">
      <button onClick={() => window.location.href = "/"} className="mb-6 text-xs font-medium text-foreground/30 hover:text-primary transition-colors">← 返回首页</button>
      {/* 头部 */}
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Trophy className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold">投票结果</h1>
        <p className="text-sm text-muted-foreground">{data.decision.title}</p>
      </div>

      {/* 胜出卡片 */}
      <Card className="mb-6 overflow-hidden border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white">
        <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
          <span className="text-xs font-bold text-amber-500">👑 最终胜出</span>
          <h2 className="text-2xl font-bold text-foreground">{winner.name}</h2>
          <p className="text-sm text-muted-foreground">
            {winner.voteCount} 票 · {totalVotes > 0 ? Math.round((winner.voteCount / totalVotes) * 100) : 0}%
            得票率
          </p>
        </CardContent>
      </Card>

      {/* 所有选项 */}
      <VoteProgress
        options={data.decision.options}
        totalVotes={totalVotes}
        selectedId={null}
        isClosed={true}
        winnerId={winner.id}
      />

      {/* 操作 */}
      <div className="mt-6 flex gap-3">
        <Button
          onClick={handleShare}
          size="lg"
          className="flex-1 gap-2 rounded-2xl font-semibold"
        >
          <Share2 className="h-4 w-4" />
          分享结果
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          size="lg"
          className="flex-1 gap-2 rounded-2xl"
        >
          <RotateCcw className="h-4 w-4" />
          再来一次
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground/40">
        由 <span className="font-semibold text-primary">DecideNow</span> 生成
      </p>
    </div>
  );
}
