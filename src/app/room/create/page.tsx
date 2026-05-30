"use client";

import { useState } from "react";
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
  const [result, setResult] = useState<{ shareCode: string; shareUrl: string; deadline: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addOption() { if (options.length < 10) setOptions([...options, ""]); }
  function removeOption(index: number) { if (options.length > 2) setOptions(options.filter((_, i) => i !== index)); }
  function updateOption(index: number, value: string) { const u = [...options]; u[index] = value; setOptions(u); }

  async function handleCreate() {
    const valid = options.filter((o) => o.trim());
    if (!title.trim() || valid.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), options: valid.map((o) => o.trim()), isAnonymous, deadlineHours }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "创建失败"); }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!result) return;
    const text = `📊 来投票！"${title}"\n\n👉 ${result.shareUrl}`;
    if (navigator.share) await navigator.share({ title: "来投票吧！", text, url: result.shareUrl }).catch(() => {});
    else { await navigator.clipboard.writeText(text); alert("链接已复制！📋"); }
  }

  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Share2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">房间创建成功！</h1>
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <p className="text-xs text-muted-foreground">分享码</p>
            <p className="text-5xl font-extrabold tracking-[0.3em] text-primary">{result.shareCode}</p>
            <p className="text-xs text-muted-foreground">截止：{new Date(result.deadline).toLocaleString("zh-CN")}</p>
          </CardContent>
        </Card>
        <Button onClick={handleShare} size="lg" className="w-full max-w-sm gap-2 rounded-2xl text-base font-semibold">
          <Share2 className="h-5 w-5" /> 分享给朋友
        </Button>
        <Button onClick={() => router.push(`/room/${result.shareCode}`)} variant="outline" className="gap-2 rounded-2xl">查看投票页面</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8 safe-top safe-bottom">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="text-muted-foreground/50 hover:text-primary transition-colors"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-extrabold text-foreground">发起投票</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">投票主题</label>
          <Textarea placeholder="周末聚会去哪儿？" value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-[80px]" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">投票选项（{options.filter((o) => o.trim()).length} 个有效）</label>
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
                <Input placeholder={`选项 ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} className="h-11 flex-1" />
                {options.length > 2 && <button onClick={() => removeOption(i)} className="text-muted-foreground/30 hover:text-destructive"><X className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button onClick={addOption} className="mt-2 flex items-center gap-1 text-sm text-muted-foreground/60 hover:text-primary transition-colors"><Plus className="h-4 w-4" />添加选项</button>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">匿名投票</span>
            <button onClick={() => setIsAnonymous(!isAnonymous)} className={`relative h-6 w-11 rounded-full transition-colors ${isAnonymous ? "bg-primary" : "bg-muted-foreground/15"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isAnonymous ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">截止时间</span>
            <select value={deadlineHours} onChange={(e) => setDeadlineHours(Number(e.target.value))} className="rounded-xl border border-border/30 bg-white px-3 py-1.5 text-sm">
              {[1, 2, 6, 12, 24, 72, 168].map((h) => (
                <option key={h} value={h}>{h >= 24 ? `${h / 24} 天后` : `${h} 小时后`}</option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleCreate} disabled={loading || !title.trim() || options.filter((o) => o.trim()).length < 2} size="lg" className="w-full gap-2 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" />正在创建...</> : <><Sparkles className="h-5 w-5" />创建投票房间</>}
        </Button>
      </div>
    </div>
  );
}
