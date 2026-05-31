-- Analytics table for North Star metrics
CREATE TABLE IF NOT EXISTS "Analytics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "event" TEXT NOT NULL,       -- 'decision_completed' | 'share_clicked' | 'room_created' | 'vote_cast' | 'visit' | 'activate'
  "mode" TEXT,                 -- 'single' | 'multi'
  "source" TEXT,               -- 'homepage' | 'share_link' | 'direct'
  "metadata" JSONB,            -- extra data
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Analytics_event_idx" ON "Analytics"("event");
CREATE INDEX "Analytics_createdAt_idx" ON "Analytics"("createdAt");
