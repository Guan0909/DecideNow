# DecideNow 部署指南（小白版）

预计用时：**15 分钟**。部署到 Vercel（免费），全球可访问。

---

## 准备工作

部署前需要确保：
- [x] 代码已在 GitHub 仓库（如果没有，先推送）
- [x] DeepSeek API Key 已获取
- [x] Supabase 项目已创建（数据库 + API 地址）

---

## 第一步：推送代码到 GitHub

如果还没有 GitHub 仓库：

1. 打开 [github.com/new](https://github.com/new)，创建一个新仓库（名字随意，如 `decidenow`）
2. **不要勾选** "Add a README file"
3. 创建后，在终端运行：

```bash
git remote add origin https://github.com/你的用户名/decidenow.git
git branch -M main
git push -u origin main
```

---

## 第二步：部署到 Vercel

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 **"New Project"**
3. 选择你的 `decidenow` 仓库
4. Vercel 会自动识别为 Next.js 项目

### ⚠️ 重要：配置环境变量

在部署页面的 **Environment Variables** 部分，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `AI_API_KEY` | `sk-你的DeepSeek密钥` | AI API Key |
| `AI_BASE_URL` | `https://api.deepseek.com/v1` | AI 接口地址 |
| `AI_MODEL` | `deepseek-chat` | 模型名 |
| `DATABASE_URL` | `postgresql://postgres:密码@db.xxx.supabase.co:6543/postgres` | Supabase 数据库地址（用连接池端口 6543） |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://你的项目.supabase.co` | Supabase 项目地址 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 anon key | Supabase 公开密钥 |

> 🔑 数据库地址换成 Supabase 的 PostgreSQL 版本（`prisma/schema.pg.prisma`）。部署前，记得把 `prisma/schema.pg.prisma` 的内容覆盖到 `prisma/schema.prisma`。

5. 点击 **"Deploy"**

---

## 第三步：等待部署

1. Vercel 会自动构建和部署（约 2-3 分钟）
2. 完成后，你会看到一个 `.vercel.app` 域名
3. 点击链接即可访问你的 DecideNow！

---

## 第四步：绑定自定义域名（可选）

1. Vercel 项目页 → Settings → Domains
2. 添加你的域名（如 `decidenow.app`）
3. 按提示在域名提供商处添加 DNS 记录

---

## 数据库切换清单

部署到 Vercel 时，需要把数据库从 SQLite 切换到 Supabase PostgreSQL：

1. 复制 `prisma/schema.pg.prisma` 内容到 `prisma/schema.prisma`
2. 确保 `DATABASE_URL` 指向 Supabase（端口 6543 连接池）
3. 运行 `npx prisma db push` 同步表结构

---

## 更新维护

每次修改代码后：
```bash
git add -A
git commit -m "描述你的改动"
git push
```
Vercel 会自动重新部署（Auto Deploy）。

---

## 常见问题

**Q: Vercel 国内访问慢？**
A: Vercel 默认域名在国内可能较慢。绑定自己的域名（国内 DNS）可以改善。

**Q: 数据库连不上？**
A: 检查 Supabase 项目是否被暂停（免费项目 1 周不用会自动暂停）。在 Supabase 控制台点击 "Restore"。

**Q: AI 不工作？**
A: 检查 DeepSeek API Key 是否还有余额，环境变量是否正确设置。
