"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { VoteProgress } from "@/components/VoteProgress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  AlertCircle,
  Clock,
  Users,
  Eye,
  EyeOff,
  Share2,
  Send,
  Ban,
} from "lucide-react";
import { formatDeadline } from "@/lib/utils";

interface RoomData {
  shareCode: string;
  isAnonymous: boolean;
  deadline: string | null;
  closedAt: string | null;
  isExpired: boolean;
  isClosed: boolean;
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

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [voting, setVoting] = useState(false);
  const [votedId, setVotedId] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${params.code}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("房间不存在或已过期");
        throw new Error("加载失败");
      }
      const data: RoomData = await res.json();
      setRoom(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }, [params.code]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // 轮询刷新票数（每 5 秒）
  useEffect(() => {
    if (!room || room.isClosed || room.isExpired) return;
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.isClosed, room?.isExpired, fetchRoom]);

  async function handleVote() {
    if (!selectedId || !room) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/rooms/${room.shareCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedId, reason: reason.trim() || null }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "投票失败");
      }

      setVotedId(selectedId);
      fetchRoom(); // 刷新
    } catch (err) {
      alert(err instanceof Error ? err.message : "投票失败");
    } finally {
      setVoting(false);
    }
  }

  async function handleShare() {
    if (!room) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: room.decision.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("链接已复制！分享给朋友们吧 📋");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error || "房间不存在"}</p>
        <Button onClick={() => router.push("/")} variant="outline">
          返回首页
        </Button>
      </div>
    );
  }

  const totalVotes = room.decision.options.reduce(
    (sum, o) => sum + o.voteCount,
    0
  );
  const isFinished = room.isClosed || room.isExpired;
  const winner = isFinished
    ? room.decision.options.reduce((a, b) =>
        a.voteCount >= b.voteCount ? a : b
      )
    : null;

  return (
    <div className="mx-auto max-w-lg px-5 py-8 safe-top safe-bottom">
      {/* 头部 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          {isFinished ? (
            <Ban className="h-5 w-5 text-destructive" />
          ) : (
            <Clock className="h-5 w-5 text-amber-500" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {isFinished ? "已截止" : formatDeadline(room.deadline ? new Date(room.deadline) : null)}
          </span>
          {room.isAnonymous ? (
            <EyeOff className="ml-auto h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="ml-auto h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <h1 className="text-xl font-bold">{room.decision.title}</h1>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{totalVotes} 人已投票</span>
        </div>
      </div>

      {/* 投票进度 */}
      <VoteProgress
        options={room.decision.options}
        totalVotes={totalVotes}
        selectedId={votedId || selectedId}
        isClosed={isFinished}
        winnerId={winner?.id ?? null}
      />

      {/* 投票区（未投票 + 未截止） */}
      {!votedId && !isFinished && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">
            选择你的答案：
          </p>
          <div className="flex flex-col gap-2">
            {room.decision.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedId(option.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedId === option.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-sm font-medium">{option.name}</span>
              </button>
            ))}
          </div>

          {/* 理由（可选） */}
          <Textarea
            placeholder="说两句...（可选）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[60px]"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleVote}
              disabled={!selectedId || voting}
              size="lg"
              className="flex-1 gap-2 rounded-2xl text-base font-semibold"
            >
              {voting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {voting ? "投票中..." : "投票"}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="gap-2 rounded-2xl"
            >
              <Share2 className="h-4 w-4" />
              拉票
            </Button>
          </div>
        </div>
      )}

      {/* 已投票提示 */}
      {votedId && !isFinished && (
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-green-600">
            ✅ 投票成功！等待其他人投票...
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            结果每 5 秒自动刷新
          </p>
        </div>
      )}

      {/* 截止后查看结果 */}
      {isFinished && (
        <div className="mt-6">
          <Button
            onClick={() => router.push(`/room/${room.shareCode}/result`)}
            size="lg"
            className="w-full gap-2 rounded-2xl text-base font-semibold"
          >
            🏆 查看最终结果
          </Button>
        </div>
      )}
    </div>
  );
}
