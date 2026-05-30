"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, User, Loader2 } from "lucide-react";
import type { ParseResult } from "@/lib/types";

interface InputEngineProps {
  mode: "single" | "multi";
  onSubmit: (input: string) => void;
}

export function InputEngine({ mode, onSubmit }: InputEngineProps) {
  const [input, setInput] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleInputChange = useCallback(
    async (value: string) => {
      setInput(value);

      // 输入超过 10 字才触发解析
      if (value.trim().length < 10) {
        setParseResult(null);
        return;
      }

      // 防抖 800ms
      setIsParsing(true);
      try {
        const res = await fetch("/api/ai/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: value.trim() }),
        });

        if (res.ok) {
          const data = await res.json();
          setParseResult(data);
        } else {
          setParseResult(null);
        }
      } catch {
        setParseResult(null);
      } finally {
        setIsParsing(false);
      }
    },
    []
  );

  const handleSubmit = () => {
    if (input.trim().length < 3) return;
    onSubmit(input.trim());
  };

  const c = parseResult?.constraints;

  return (
    <div className="flex flex-col gap-4">
      {/* 输入框 */}
      <div className="relative">
        <Textarea
          placeholder={
            mode === "single"
              ? "告诉我你的需求，AI 帮你选...\n比如：三个人，人均80，徐家汇吃辣的，要能聊天"
              : "发起一个投票决定...\n比如：周末聚会去哪儿？"
          }
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          className="min-h-[120px] resize-none rounded-2xl border-2 border-border/50 bg-white p-5 text-base shadow-sm transition-all focus:border-primary focus:shadow-md"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        {/* 字数提示 */}
        <span className="absolute bottom-3 right-3 text-xs text-muted-foreground/50">
          {input.length}/500
        </span>
      </div>

      {/* AI 解析结果标签 */}
      {parseResult && c && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary/5 px-4 py-3">
          <Sparkles className="h-4 w-4 text-primary" />
          {c.people && (
            <Badge variant="secondary" className="text-xs">
              👥 {c.people}人
            </Badge>
          )}
          {c.budget && (
            <Badge variant="secondary" className="text-xs">
              💰 人均¥{c.budget}
            </Badge>
          )}
          {c.location && (
            <Badge variant="secondary" className="text-xs">
              📍 {c.location}
            </Badge>
          )}
          {c.taste && (
            <Badge variant="secondary" className="text-xs">
              👅 {c.taste}
            </Badge>
          )}
          {c.atmosphere && (
            <Badge variant="secondary" className="text-xs">
              ✨ {c.atmosphere}
            </Badge>
          )}
          {c.occasion && (
            <Badge variant="secondary" className="text-xs">
              🎯 {c.occasion}
            </Badge>
          )}
          {parseResult.missingFields.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {isParsing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                `补充：${parseResult.missingFields.join("、")}`
              )}
            </span>
          )}
        </div>
      )}

      {/* 提交按钮 */}
      <Button
        onClick={handleSubmit}
        disabled={input.trim().length < 3}
        size="lg"
        className="w-full gap-2 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
      >
        {mode === "single" ? (
          <>
            <User className="h-5 w-5" />
            让 AI 帮我决定
          </>
        ) : (
          <>
            <Users className="h-5 w-5" />
            发起投票
          </>
        )}
      </Button>
    </div>
  );
}
