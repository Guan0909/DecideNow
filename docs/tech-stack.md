# DecideNow - 技术选型与架构

## 技术栈

| 层次 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 框架 | Next.js (App Router) | 14.x | 全栈一体，RSC 性能好，Vercel 一键部署 |
| 语言 | TypeScript | 5.x | 类型安全，降低 bug |
| 样式 | Tailwind CSS | 3.x | 移动端优先，原子化 CSS，开发快 |
| 组件库 | shadcn/ui | latest | 基于 Radix，无障碍，可定制 |
| 数据库 | PostgreSQL (Supabase) | 15 | 免费托管，自带 Auth + Realtime |
| ORM | Prisma | 5.x | 类型安全 ORM，迁移工具完善 |
| AI SDK | OpenAI SDK | 4.x | 兼容 DeepSeek 等第三方 API |
| 实时 | Supabase Realtime | - | WebSocket 推送，免运维 |
| 认证 | Supabase Auth | - | 支持匿名 + 邮箱/手机登录 |
| 部署 | Vercel | - | 与 Next.js 同源，免费额度 |

## 架构图

```
用户浏览器 (Mobile-first PWA)
        │
        ▼
┌───────────────────┐
│   Vercel 部署      │
│  Next.js 14        │
│  ┌──────┐ ┌──────┐│
│  │ 页面  │ │ API  ││
│  │ RSC  │ │Routes││
│  └──────┘ └──────┘│
└───┬───────────┬───┘
    │           │
    ▼           ▼
┌────────┐ ┌──────────┐
│Supabase│ │DeepSeek  │
│  PG    │ │API (兼容 │
│+Auth   │ │OpenAI)   │
│+RT     │ │          │
└────────┘ └──────────┘
```

## 数据库设计

详见 `prisma/schema.prisma`，核心表：

- **User** — 用户（匿名和正式）
- **Decision** — 决策记录（单人/多人，约束条件 JSON）
- **Option** — 选项（名称、AI 推荐语、评分卡 JSON、票数）
- **Vote** — 投票记录
- **Room** — 多人投票房间（分享码、匿名设置、截止时间）

## 关键设计决策

1. **AI 兼容性**：使用 OpenAI SDK 的 `baseURL` 参数指向 DeepSeek，一行配置即可切换
2. **实时通信**：利用 Supabase Realtime 的 PostgreSQL LISTEN/NOTIFY，无需额外 WebSocket 服务
3. **认证策略**：匿名会话用于核心流程，正式登录用于历史记录等持久化功能
4. **地图数据**：MVP 阶段 AI 基于训练数据推荐地点，导航链接拼接高德搜索 URL
5. **决策卡片图片**：浏览器端 HTML→Canvas 方案（html-to-image），无需服务端渲染
