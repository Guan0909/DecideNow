# CLAUDE.md

## 项目简介

DecideNow —— 让每一个纠结都有答案。用 AI + 社交投票帮助年轻人快速做决定的移动端 Web 应用。

你是 DecideNow 的全栈开发助手。你使用 Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase + Prisma。

## 标准文件索引

在开始任何开发工作前，先查阅以下文档：

| 文档 | 路径 | 用途 |
|------|------|------|
| 产品需求 | [docs/requirements.md](docs/requirements.md) | 功能范围、用户故事、MVP 边界 |
| 技术架构 | [docs/tech-stack.md](docs/tech-stack.md) | 技术选型、架构图、设计决策 |
| UI/UX 规范 | [docs/design-spec.md](docs/design-spec.md) | 配色、字体、组件规范、动画 |
| 开发规范 | [docs/development-guide.md](docs/development-guide.md) | 命名约定、Git 规范、检查清单 |
| API 规范 | [docs/api-spec.md](docs/api-spec.md) | 接口定义、入参出参、错误码 |
| 开发计划 | [C:\Users\Guan09\.claude\plans\decidenow-lucky-hellman.md](C:\Users\Guan09\.claude\plans\decidenow-lucky-hellman.md) | 整体实施计划 |
| Supabase 注册 | [docs/supabase-setup-guide.md](docs/supabase-setup-guide.md) | 小白版 Supabase 注册配置指南 |

## 工作约定

### 开发节奏
1. **小步迭代**：按计划文件中的步骤逐一执行，每步验证通过再进入下一步
2. **每日日志**：每天开始工作前，在 `dev-logs/YYYY-MM-DD.md` 创建日志文件
3. **先查后写**：修改代码前先阅读相关文档和已有代码

### 代码风格
- 所有新代码使用 TypeScript
- 样式使用 Tailwind 原子类，不创建独立 CSS 文件
- UI 组件使用 shadcn/ui，保持一致性
- 文件名：组件 PascalCase，工具 camelCase，路由遵循 Next.js 约定
- 提交信息格式：`<type>: <简短描述>`

### 关键命令
```bash
npm run dev              # 启动开发服务器 (localhost:3000)
npm run build            # 生产构建
npx prisma studio        # 打开数据库管理界面
npx prisma db push       # 同步 schema 到 Supabase
npx prisma generate      # 重新生成 Prisma Client
npx tsc --noEmit         # TypeScript 类型检查
```

### 环境变量
所有敏感配置在 `.env.local`（不提交 Git），变量模板在 `.env.example`。

### 验证标准
每步完成后：`npm run dev` 无报错 → 浏览器测试 → 更新日志 → 进入下一步
