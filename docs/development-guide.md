# DecideNow - 开发执行规范

## 开发流程

本项目采用**小步迭代**策略，每个开发步骤必须：

1. 明确该步骤的输入和产出
2. 完成编码
3. `npm run dev` 验证无报错
4. 浏览器手动测试关键功能
5. 更新 `dev-logs/` 当天日志
6. 确认无误后进入下一步

## 命名规范

### 文件命名
- 组件文件：PascalCase（如 `OptionCard.tsx`）
- 工具文件：camelCase（如 `ai.ts`、`utils.ts`）
- 路由文件：Next.js 约定（`page.tsx`、`route.ts`、`layout.tsx`）
- 文档文件：kebab-case（如 `tech-stack.md`）

### 变量命名
- 组件：PascalCase（`OptionCard`）
- 函数/变量：camelCase（`generateOptions`、`userName`）
- 常量：UPPER_SNAKE_CASE（`MAX_OPTIONS`）
- 类型/接口：PascalCase（`Decision`, `OptionCardProps`）
- 数据库字段：camelCase（`voteCount`）

### CSS 类名
- 使用 Tailwind 原子类，避免自定义 class
- 复杂样式抽取为组件，不写 CSS 文件

## Git 规范

### 分支策略
- `main` — 稳定版本，随时可部署
- 功能在 `main` 上直接开发（单人项目）

### Commit 格式
```
<type>: <简短描述>

类型：
- feat: 新功能
- fix: 修复 bug
- refactor: 重构
- style: 样式调整
- docs: 文档更新
- chore: 工具/配置变更

示例：
feat: 添加 AI 选项生成 API
fix: 修复投票进度条不更新问题
docs: 更新 tech-stack 文档
```

## 关键命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npx prisma studio    # 打开数据库管理界面
npx prisma db push   # 同步 schema 到数据库
npx prisma generate  # 重新生成 Prisma Client
```

## 环境变量

所有敏感信息放在 `.env.local`（不提交到 Git）。模板文件 `.env.example` 列出所需变量但不含真实值。

## 检查清单

每完成一个开发步骤，确认：

- [ ] 代码通过 TypeScript 类型检查（`npx tsc --noEmit`）
- [ ] `npm run dev` 正常启动
- [ ] 功能在浏览器 / 手机预览中测试通过
- [ ] 没有遗留的 `console.log` 调试代码
- [ ] 更新 `dev-logs/` 日志
