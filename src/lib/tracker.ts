// 轻量埋点——北极星指标体系
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("decidenow_sid");
  if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem("decidenow_sid", sid); }
  return sid;
}

export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const payload: Record<string, unknown> = {
      event,
      sessionId: getSessionId(),
      ...data,
    };
    // 标记来源
    const visited = sessionStorage.getItem("decidenow_visited");
    if (!visited) {
      payload.source = "first_visit";
      sessionStorage.setItem("decidenow_visited", "1");
    }

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

// ============================================
// 北极星指标体系 · 快捷方法
// ============================================
export const Metrics = {
  // 1. 访问
  visit: () => track("visit"),

  // 2. 激活：1分钟内发起第一个决定
  activate: (mode: "single" | "multi") =>
    track("activate", { mode }),

  // 3. AI 生成完成
  aiGenerated: (optionCount: number, latencyMs: number) =>
    track("ai_generated", { optionCount, latencyMs }),

  // 4. 决策完成（北极星核心）
  decisionCompleted: (mode: "single" | "multi", aiPicked: boolean) =>
    track("decision_completed", { mode, aiPicked }),

  // 5. 分享裂变
  shareClicked: (type: "card" | "room" | "result") =>
    track("share_clicked", { type }),

  // 6. 房间创建
  roomCreated: (optionCount: number) =>
    track("room_created", { optionCount }),

  // 7. 投票参与
  voteCast: () => track("vote_cast"),

  // 8. 导航行为
  navigated: () => track("navigated"),

  // 9. 重试决策
  retry: () => track("retry"),
};
