-- ============================================
-- DecideNow 北极星指标体系 · 完整建表
-- 使用方式：在 Supabase SQL Editor 全部选中运行
-- ============================================

-- 1. 删除旧表
DROP TABLE IF EXISTS "Analytics" CASCADE;

-- 2. 创建新表
CREATE TABLE "Analytics" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "event"      TEXT NOT NULL,
  "mode"       TEXT,
  "source"     TEXT,
  "sessionId"  TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 索引
CREATE INDEX "idx_analytics_event"     ON "Analytics" ("event");
CREATE INDEX "idx_analytics_created"   ON "Analytics" ("createdAt");
CREATE INDEX "idx_analytics_session"   ON "Analytics" ("sessionId");

-- ============================================
-- 字段说明
-- ============================================
-- event:     visit | activate | ai_generated | decision_completed |
--            share_clicked | room_created | vote_cast | retry | navigated
-- mode:      single | multi
-- source:    first_visit | return | share_link
-- sessionId: 浏览器会话 UUID，串联用户完整行为漏斗
-- metadata:  { aiPicked, optionCount, latencyMs, shareType }
-- ============================================
