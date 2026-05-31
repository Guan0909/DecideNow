// 轻量埋点——fire-and-forget，不阻塞用户交互
export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const payload: Record<string, unknown> = { event, ...data };
    // 标记首次访问
    const visited = sessionStorage.getItem("decidenow_visited");
    if (!visited) { payload.source = "first_visit"; sessionStorage.setItem("decidenow_visited", "1"); }
    else payload.source = "return";

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

// 北极星指标快捷方法
export const Metrics = {
  visit: () => track("visit"),
  activate: () => track("activate", { mode: "single" }),
  decisionCompleted: (mode: "single" | "multi", aiPicked: boolean) =>
    track("decision_completed", { mode, aiPicked }),
  shareClicked: (type: "card" | "room") => track("share_clicked", { type }),
  roomCreated: () => track("room_created"),
  voteCast: () => track("vote_cast"),
};
