# Supabase 注册与配置指南（小白版）

这份指南帮你一步步注册 Supabase，拿到数据库连接地址。

预计用时：**10 分钟**，完全免费，无需信用卡。

---

## 第一步：注册 Supabase 账号

1. 打开浏览器，访问 **https://supabase.com**
2. 点击右上角的 **"Sign Up"**（注册）
3. 选择 **GitHub 登录**（推荐，最简单），或者用邮箱注册
4. 授权后进入 Supabase 控制台

## 第二步：创建项目

1. 点击 **"New project"**（新建项目）
2. 填写以下信息：

   | 字段 | 填写内容 |
   |------|----------|
   | Name | `decidenow` |
   | Database Password | **自己设一个密码，记下来！**（至少8位） |
   | Region | 选择 **`ap-southeast-1 (Singapore)`** 或 **`ap-northeast-1 (Tokyo)`** 离国内最近的 |

3. 点击 **"Create new project"**
4. 等待 1-2 分钟，数据库创建完成

## 第三步：获取连接信息

项目创建完成后，你会看到控制台页面。我们需要三样东西：

### 1. 数据库连接地址

1. 左侧菜单点击 **设置图标（⚙️）→ Database**
2. 找到 **"Connection string"** 区域
3. 选择 **"URI"** 标签
4. 复制那串地址，长这样：
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@xxx.supabase.co:5432/postgres
   ```
5. 把 `[YOUR-PASSWORD]` 替换成你在第二步设置的密码

### 2. Supabase URL 和 Anon Key

1. 左侧菜单点击 **设置图标（⚙️）→ API**
2. 你会看到：
   - **Project URL**（项目地址）← 复制这个
   - **anon public key**（公开密钥）← 复制这个

## 第四步：配置到项目中

打开项目文件夹 `d:\DecideNow`，创建文件 `.env.local`，填入以下内容：

```bash
# 把等号右边的值替换成你刚才复制的

DATABASE_URL=postgresql://postgres.xxx:你的密码@xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
```

> ⚠️ `.env.local` 文件不会被提交到 Git，保证你的密码安全。

## 第五步：同步数据库

回到终端，在项目目录下运行：

```bash
npx prisma db push
```

如果看到 `Your database is now in sync with your schema.` 就成功了！

---

## 常见问题

**Q: 注册 Supabase 需要翻墙吗？**
A: Supabase 官网国内可以访问，但偶尔较慢。如果打不开，试试用手机热点。

**Q: 免费额度够用吗？**
A: 免费版包含 500MB 数据库空间 + 每月 2GB 流量，MVP 阶段完全够用。

**Q: 数据库密码忘了怎么办？**
A: Supabase 控制台 → Database → 可以重置密码。
