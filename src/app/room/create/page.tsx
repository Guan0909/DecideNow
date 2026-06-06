"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Share2, Wand2, Copy, Check } from "lucide-react";
import { Metrics } from "@/lib/tracker";

const SYSTEM_PROMPT = `你是 DecideNow 的投票助手。根据用户输入的主题和地点，生成 2-4 个投票选项。每个选项必须包含一个具体的推荐地点。返回 JSON: [{"name":"密室逃脱","location":"X先生密室（徐汇店）"}]
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
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("decidenow_room_title");
    if (saved) { setTitle(saved); sessionStorage.removeItem("decidenow_room_title"); handleAiFill(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addOption() { if (options.length < 10) setOptions([...options, ""]); }
  function removeOption(i: number) { if (options.length > 2) setOptions(options.filter((_, j) => j !== i)); }
  function updateOption(i: number, v: string) { const u = [...options]; u[i] = v; setOptions(u); }

  async function handleAiFill(titleText?: string) {
    const topic = titleText || title.trim();
    if (!topic || topic.length < 3) return;
    const loc = sessionStorage.getItem("decidenow_room_location") || "";
    const query = loc ? `${loc}附近，${topic}` : topic;
    setAiLoading(true);
    try {
      // 重试最多2次
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch("/api/ai/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "deepseek-v4-pro", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: query }], temperature: 0.7, max_tokens: 300 }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        // 尝试多种数组提取模式
        let match = text.match(/\[[\s\S]*\]/);
        if (!match) { // 尝试匹配代码块
          const cm = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
          match = cm ? [cm[1]] : null;
        }
        if (match) {
          try {
            const arr = JSON.parse(match[0]);
            if (Array.isArray(arr) && arr.length >= 2) {
              setOptions(arr.map((item: string | { name: string; location: string }) => typeof item === "string" ? item : `${item.name} · ${item.location}`));
              break; // 成功，退出重试
            }
          } catch {}
        }
        // 第2次尝试用更简单的提示词
        if (attempt === 0) continue;
        const retryRes = await fetch("/api/ai/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "deepseek-v4-pro", messages: [{ role: "user", content: `为"${query}"生成3个投票选项，仅返回JSON数组:["选项1","选项2","选项3"]` }], temperature: 0.3, max_tokens: 200 }),
        });
        if (retryRes.ok) {
          const d2 = await retryRes.json();
          const t2 = d2.choices?.[0]?.message?.content || "";
          const m2 = t2.match(/\[[\s\S]*\]/);
          if (m2) { try { const arr = JSON.parse(m2[0]); if (Array.isArray(arr) && arr.length >= 2) setOptions(arr); } catch {} }
        }
      }
    } catch { /* ignore */ } finally { setAiLoading(false); }
  }

  async function handleCreate() {
    const valid = options.filter((o) => o.trim());
    if (!title.trim() || valid.length < 2) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), options: valid.map((o) => o.trim()), isAnonymous, deadlineHours }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "创建失败"); }
      setResult(await res.json());
      Metrics.roomCreated(valid.length);
    } catch (err) { setError(err instanceof Error ? err.message : "创建失败"); } finally { setLoading(false); }
  }

  /* ---- Success ---- */
  if (result) {
    const copy = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center safe-top safe-bottom">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-pop"><Share2 className="h-10 w-10 text-primary" /></div>
        <h1 className="text-2xl font-extrabold text-foreground">房间创建成功</h1>
        <div className="card-premium w-full max-w-sm p-6 flex flex-col items-center gap-4">
          <p className="text-xs text-muted-foreground">分享码</p>
          <div className="flex items-center gap-2">
            <p className="text-5xl font-extrabold tracking-[0.3em] text-primary">{result.shareCode}</p>
            <button onClick={() => copy(result.shareCode)} className="rounded-xl border border-border bg-card p-2 text-foreground/60 hover:text-primary transition-colors">{copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-[280px]">
            <input readOnly value={result.shareUrl} className="input-premium flex-1 py-2 text-xs text-foreground" />
            <button onClick={() => copy(result.shareUrl)} className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground/70 hover:text-primary transition-colors">{copied ? "已复制" : "复制"}</button>
          </div>
          <p className="text-xs text-muted-foreground">截止：{new Date(result.deadline).toLocaleString("zh-CN")}</p>
        </div>
        <Button onClick={() => {
          const text = `📊 来投票！"${title}"\n\n👉 ${result.shareUrl}`;
          if (navigator.share) navigator.share({ title: "来投票吧！", text, url: result.shareUrl }).catch(() => {});
          else { navigator.clipboard.writeText(text); alert("已复制！"); }
        }} size="lg" className="w-full max-w-sm gap-2">📤 分享给朋友</Button>
        <Button onClick={() => router.push(`/room/${result.shareCode}`)} variant="outline">查看投票页面</Button>
      </div>
    );
  }

  /* ---- Form ---- */
  return (
    <div className="mx-auto max-w-lg px-5 py-8 safe-top safe-bottom bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-xs font-medium text-foreground/30 hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-4 w-4" />返回</button>
        <span className="text-xs font-bold tracking-[0.2em] text-foreground/20">DECIDENOW</span>
      </div>

      <h1 className="mb-8 text-[2rem] font-extrabold leading-tight tracking-[-0.01em] text-foreground">发起投票</h1>

      {error && <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground/70">投票主题</label>
          <textarea placeholder="周末聚会去哪儿？" value={title} onChange={(e) => setTitle(e.target.value)} rows={2} className="input-premium resize-none" />
        </div>

        {/* Options */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground/70">选项（{options.filter((o) => o.trim()).length} 个有效）</label>
            <button onClick={() => handleAiFill()} disabled={aiLoading || title.trim().length < 3} className="flex items-center gap-1 text-xs font-medium text-primary disabled:opacity-30">
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}AI 预填
            </button>
          </div>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground/40">{i + 1}</span>
                <input placeholder={`选项 ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} className="input-premium flex-1" />
                {options.length > 2 && <button onClick={() => removeOption(i)} className="p-1 text-foreground/15 hover:text-destructive"><X className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button onClick={addOption} className="mt-2 flex items-center gap-1 text-sm text-foreground/30 hover:text-primary"><Plus className="h-4 w-4" />添加</button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground/50">投票设置</p>

          <div className="card-premium flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-foreground">匿名投票</p>
              <p className="text-xs text-muted-foreground">参与者身份保密</p>
            </div>
            <button onClick={() => setIsAnonymous(!isAnonymous)} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${isAnonymous ? "bg-primary" : "bg-border"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isAnonymous ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          <div className="card-premium px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-sm font-medium text-foreground">截止时间</p><p className="text-xs text-muted-foreground">超时自动结束</p></div>
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{deadlineHours >= 24 ? `${deadlineHours / 24}天后` : `${deadlineHours}小时后`}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[{ label: "1h", value: 1 }, { label: "2h", value: 2 }, { label: "6h", value: 6 }, { label: "12h", value: 12 }, { label: "1天", value: 24 }, { label: "2天", value: 48 }, { label: "3天", value: 72 }, { label: "7天", value: 168 }].map(({ label, value }) => (
                <button key={value} onClick={() => setDeadlineHours(value)}
                  className={`rounded-lg py-2.5 text-xs font-medium transition-all ${deadlineHours === value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleCreate} disabled={loading || !title.trim() || options.filter((o) => o.trim()).length < 2} size="lg" className="w-full gap-2 shadow-lg shadow-primary/20">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" />创建中...</> : <><Sparkles className="h-5 w-5" />创建投票房间</>}
        </Button>
      </div>
    </div>
  );
}
