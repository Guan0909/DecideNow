-- ============================================
-- DecideNow 北极星指标看板
-- 在 Supabase SQL Editor 中运行
-- ============================================

-- ① 北极星：本周完成的有意义决策数
SELECT '北极星-本周决策' as metric, count(*) as value
FROM "Analytics"
WHERE event = 'decision_completed'
AND "createdAt" > now() - interval '7 days';

-- ② 激活率：访问后发起决定的比例
SELECT '激活漏斗' as metric,
  (SELECT count(DISTINCT "sessionId") FROM "Analytics" WHERE event = 'visit') as visitors,
  (SELECT count(DISTINCT "sessionId") FROM "Analytics" WHERE event = 'activate') as activated,
  round(100.0 * (SELECT count(DISTINCT "sessionId") FROM "Analytics" WHERE event = 'activate') /
    nullif((SELECT count(DISTINCT "sessionId") FROM "Analytics" WHERE event = 'visit'), 0), 1) as activation_rate_pct;

-- ③ AI 采纳率：用户选 AI 首推的比例
SELECT 'AI采纳率' as metric,
  count(*) as total_decisions,
  sum(case when (metadata->>'aiPicked')::boolean then 1 else 0 end) as picked_ai_first,
  round(100.0 * sum(case when (metadata->>'aiPicked')::boolean then 1 else 0 end) / nullif(count(*), 0), 1) as ai_adoption_pct
FROM "Analytics" WHERE event = 'decision_completed';

-- ④ 分享率
SELECT '分享率' as metric,
  (SELECT count(DISTINCT "sessionId") FROM "Analytics" WHERE event = 'decision_completed') as completed,
  (SELECT count(*) FROM "Analytics" WHERE event = 'share_clicked') as shared,
  round(100.0 * (SELECT count(*) FROM "Analytics" WHERE event = 'share_clicked') /
    nullif((SELECT count(DISTINCT "sessionId") FROM "Analytics" WHERE event = 'decision_completed'), 0), 1) as share_rate_pct;

-- ⑤ 单人/多人模式分布
SELECT '模式分布' as metric, mode,
  count(*) as decisions,
  round(100.0 * count(*) / nullif(sum(count(*)) over(), 0), 1) as pct
FROM "Analytics" WHERE event = 'decision_completed' GROUP BY mode;

-- ⑥ AI 生成平均耗时
SELECT 'AI性能' as metric,
  round(avg((metadata->>'latencyMs')::numeric), 0) as avg_ms,
  round(min((metadata->>'latencyMs')::numeric), 0) as min_ms,
  round(max((metadata->>'latencyMs')::numeric), 0) as max_ms
FROM "Analytics" WHERE event = 'ai_generated';

-- ⑦ 每日决策趋势（最近14天）
SELECT '每日趋势' as metric,
  date("createdAt") as day,
  count(*) filter (where event = 'decision_completed') as decisions,
  count(*) filter (where event = 'room_created') as rooms,
  count(*) filter (where event = 'vote_cast') as votes
FROM "Analytics"
WHERE "createdAt" > now() - interval '14 days'
GROUP BY day ORDER BY day;

-- ⑧ K因子：平均每个决策带来的新访问
-- 通过 sessionId 关联，首次访问来自分享链接的即为裂变
SELECT '裂变K因子' as metric,
  count(DISTINCT "sessionId") as total_sessions,
  count(DISTINCT "sessionId") filter (where source = 'first_visit') as new_users,
  round(count(DISTINCT "sessionId") filter (where source = 'first_visit')::numeric /
    nullif(count(DISTINCT "sessionId") filter (where source = 'return'), 0), 2) as k_factor
FROM "Analytics" WHERE event = 'visit';
