-- ============================================
-- DecideNow 北极星指标体系 · 数据库表
-- ============================================

CREATE TABLE IF NOT EXISTS "Analytics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "event" TEXT NOT NULL,
  "mode" TEXT,                 -- 'single' | 'multi'
  "source" TEXT,               -- 'first_visit' | 'return' | 'share_link'
  "metadata" JSONB,            -- { aiPicked, optionIndex, totalOptions, shareType, ... }
  "sessionId" TEXT,            -- 会话ID，串联用户行为漏斗
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Analytics_event_idx" ON "Analytics"("event");
CREATE INDEX IF NOT EXISTS "Analytics_createdAt_idx" ON "Analytics"("createdAt");
CREATE INDEX IF NOT EXISTS "Analytics_session_idx" ON "Analytics"("sessionId");
