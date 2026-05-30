"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Share2 } from "lucide-react";

export default function CreateRoom() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    shareCode: string;
    shareUrl: string;
    deadline: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedInput = params.get("q");
    if (savedInput) {
      setTitle(savedInput);
    }
  }, []);

  function addOption() {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function updateOption(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  async function handleCreate() {
    const validOptions = options.filter((o) => o.trim());
    if (!title.trim() || validOptions.length < 2) return;

    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          options: validOptions.map((o) => o.trim()),
          isAnonymous,
          deadlineHours,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      const data = await res.json();
      setResult(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!result) return;
    const text = `📊 来投票！"${title}"\n\n点击链接参与 → ${result.shareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "来投票吧！", text, url: result.shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("链接已复制！发到群里让朋友们投票吧 📋");
    }
  }

  // 创建成功页
  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#FFF5F0] to-background px-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Share2 className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">房间创建成功！</h1>
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <p className="text-sm text-muted-foreground">分享码</p>
            <p className="text-4xl font-bold tracking-[0.3em] text-primary">
              {result.shareCode}
            </p>
            <p className="text-xs text-muted-foreground">
              截止时间：{new Date(result.deadline).toLocaleString("zh-CN")}
            </p>
          </CardContent>
        </Card>
        <Button
          onClick={handleShare}
          size="lg"
          className="w-full max-w-sm gap-2 rounded-2xl text-base font-semibold"
        >
          <Share2 className="h-5 w-5" />
          分享给朋友
        </Button>
        <Button
          onClick={() => router.push(`/room/${result.shareCode}`)}
          variant="outline"
          className="gap-2 rounded-2xl"
        >
          查看投票页面
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-8 safe-top safe-bottom">
      {/* 头部 */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">发起投票</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* 标题 */}
        <div>
          <label className="mb-2 block text-sm font-medium">投票主题</label>
          <Textarea
            placeholder="周末聚会去哪儿？"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* 选项 */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            投票选项（{options.filter((o) => o.trim()).length} 个有效）
          </label>
          <div className="flex flex-col gap-2">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <Input
                  placeholder={`选项 ${index + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="h-11 flex-1"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="text-muted-foreground/50 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              onClick={addOption}
              className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              添加选项
            </button>
          )}
        </div>

        {/* 设置 */}
        <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">匿名投票</span>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isAnonymous ? "bg-primary" : "bg-muted-foreground/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isAnonymous ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">截止时间</span>
            <select
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(Number(e.target.value))}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
            >
              <option value={1}>1 小时后</option>
              <option value={2}>2 小时后</option>
              <option value={6}>6 小时后</option>
              <option value={12}>12 小时后</option>
              <option value={24}>24 小时后</option>
              <option value={72}>3 天后</option>
              <option value={168}>7 天后</option>
            </select>
          </div>
        </div>

        {/* 创建按钮 */}
        <Button
          onClick={handleCreate}
          disabled={loading || !title.trim() || options.filter((o) => o.trim()).length < 2}
          size="lg"
          className="w-full gap-2 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              正在创建...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              创建投票房间
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
