"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Share2, Wand2, Copy, Check } from "lucide-react";

const SYSTEM_PROMPT = `你是 DecideNow 的投票助手。根据用户输入的主题和地点，生成 2-4 个投票选项。
每个选项必须包含一个具体的推荐地点（真实存在的店名或场所）。
返回 JSON 数组，格式如下：
[{"name":"密室逃脱","location":"X先生密室（徐汇店）"},{"name":"烧烤露营","location":"顾村公园烧烤区"},{"name":"KTV","location":"好乐迪（五角场店）"}]
name 不超过10字，location 包含店名+区域，不超过20字。`;

export default function CreateRoom() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [result, setResult] = useState<{ shareCode: string; shareUrl: string; deadline: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 从首页传入的标题（仅首次挂载执行）
  useEffect(() => {
    const saved = sessionStorage.getItem("decidenow_room_title");
    if (saved) {
      setTitle(saved);
      sessionStorage.removeItem("decidenow_room_title");
      handleAiFill(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addOption() { if (options.length < 10) setOptions([...options, ""]); }
  function removeOption(index: number) { if (options.length > 2) setOptions(options.filter((_, i) => i !== index)); }
  function updateOption(index: number, value: string) { const u = [...options]; u[index] = value; setOptions(u); }

  // AI 预填选项
  async function handleAiFill(titleText?: string) {
    const topic = titleText || title.trim();
    if (!topic || topic.length < 3) return;
    setAiLoading(true);
    try {
      const apiKey = "sk-c6544b31afef47a2b3d6a9cb0bcb3709";
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: topic },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });
      if (!res.ok) throw new Error("AI 请求失败");
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr) && arr.length >= 2) {
          // 支持新格式 [{name, location}] 和旧格式 ["string"]
          const names = arr.map((item: string | { name: string; location: string }) =>
            typeof item === "string" ? item : `${item.name} · ${item.location}`
          );
          setOptions(names);
        }
      }
    } catch {
      // AI 失败不阻塞
    } finally {
      setAiLoading(false);
    }
  }

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 text-center"
        style={{ background: "linear-gradient(175deg, #F6F3ED 0%, #EFEBE3 35%, #F8F5F0 100%)" }}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Share2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">房间创建成功！</h1>
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <p className="text-xs text-muted-foreground">分享码</p>
            <div className="flex items-center gap-2">
              <p className="text-5xl font-extrabold tracking-[0.3em] text-primary">{result.shareCode}</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(result.shareCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 rounded-xl border border-foreground/10 bg-white/60 p-2 text-foreground/40 hover:text-primary hover:border-primary/30 transition-all"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-[280px]">
              <input
                readOnly
                value={result.shareUrl}
                className="flex-1 rounded-xl border border-foreground/10 bg-white/60 px-3 py-2 text-xs text-muted-foreground truncate focus:outline-none"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(result.shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 rounded-xl border border-foreground/10 bg-white/60 px-3 py-2 text-xs font-medium text-foreground/50 hover:text-primary hover:border-primary/30 transition-all"
              >
                {copied ? "已复制" : "复制链接"}
              </button>
            </div>
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
    <div className="mx-auto max-w-lg px-6 py-8 safe-top safe-bottom"
      style={{ background: "linear-gradient(175deg, #F6F3ED 0%, #EFEBE3 35%, #F8F5F0 100%)", minHeight: "100vh" }}>
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="text-foreground/40 hover:text-primary transition-colors"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-extrabold text-foreground">发起投票</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">投票主题</label>
          <Textarea placeholder="周末聚会去哪儿？" value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-[80px]" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              投票选项（{options.filter((o) => o.trim()).length} 个有效）
            </label>
            <button
              onClick={() => handleAiFill()}
              disabled={aiLoading || title.trim().length < 3}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-30 transition-all"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
              AI 预填
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-xs font-bold text-foreground/50">{i + 1}</span>
                <Input placeholder={`选项 ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} className="h-11 flex-1" />
                {options.length > 2 && <button onClick={() => removeOption(i)} className="text-foreground/20 hover:text-destructive"><X className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button onClick={addOption} className="mt-2 flex items-center gap-1 text-sm text-foreground/35 hover:text-primary transition-colors"><Plus className="h-4 w-4" />添加选项</button>
          )}
        </div>

        {/* 投票设置 */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-foreground/60">投票设置</p>

          {/* 匿名开关 */}
          <div className="flex items-center justify-between rounded-2xl bg-foreground/[0.03] px-5 py-4">
            <div>
              <span className="text-sm font-medium text-foreground">匿名投票</span>
              <p className="text-xs text-muted-foreground mt-0.5">参与者身份保密</p>
            </div>
            <button onClick={() => setIsAnonymous(!isAnonymous)} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${isAnonymous ? "bg-primary" : "bg-foreground/10"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isAnonymous ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          {/* 截止时间 */}
          <div className="rounded-2xl bg-foreground/[0.03] px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">截止时间</span>
                <p className="text-xs text-muted-foreground mt-0.5">超过后自动结束投票</p>
              </div>
              <span className="rounded-xl bg-white/60 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20">
                {deadlineHours >= 24 ? `${deadlineHours / 24} 天后截止` : `${deadlineHours} 小时后截止`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "1h", value: 1 },
                { label: "2h", value: 2 },
                { label: "6h", value: 6 },
                { label: "12h", value: 12 },
                { label: "1天", value: 24 },
                { label: "2天", value: 48 },
                { label: "3天", value: 72 },
                { label: "7天", value: 168 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setDeadlineHours(value)}
                  className={`rounded-xl py-2.5 text-xs font-medium transition-all ${
                    deadlineHours === value
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-white/50 text-muted-foreground hover:bg-white hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleCreate} disabled={loading || !title.trim() || options.filter((o) => o.trim()).length < 2} size="lg" className="w-full gap-2 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" />正在创建...</> : <><Sparkles className="h-5 w-5" />创建投票房间</>}
        </Button>
      </div>
    </div>
  );
}
