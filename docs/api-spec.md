# DecideNow - API 接口规范

## 通用规范

- Base URL: `/api`
- 请求格式: JSON
- 响应格式: JSON
- 错误格式: `{ error: string, code: string }`
- 认证: 匿名用户通过 `X-Anonymous-Id` header 标识；登录用户通过 Supabase Session Cookie

---

## AI 模块

### POST /api/ai/parse

解析用户自然语言输入，提取约束条件。

**Request:**
```json
{
  "input": "三个人，人均80元，徐家汇附近，想吃辣的"
}
```

**Response:**
```json
{
  "constraints": {
    "people": 3,
    "budget": 80,
    "location": "徐家汇",
    "taste": "辣",
    "atmosphere": null,
    "occasion": null
  },
  "missingFields": ["atmosphere"]
}
```

### POST /api/ai/generate

根据约束条件生成 3 个决策选项。

**Request:**
```json
{
  "constraints": {
    "people": 3,
    "budget": 80,
    "location": "徐家汇",
    "taste": "辣"
  }
}
```

**Response:**
```json
{
  "options": [
    {
      "name": "破店小酒馆（徐汇店）",
      "description": "江湖风装修够放松，辣度可选，最近还上新了杨梅酒——适合三个人的微醺午餐。",
      "scoreCard": { "taste": 4, "ambiance": 5, "budget": 4 },
      "priceHint": "人均78元",
      "locationHint": "徐汇区天钥桥路"
    }
  ]
}
```

---

## 决策模块

### POST /api/decisions

创建新决策。

**Request:**
```json
{
  "title": "三个人吃辣，徐家汇附近",
  "mode": "SINGLE",
  "constraints": { "people": 3, "budget": 80, "location": "徐家汇", "taste": "辣" },
  "options": [{ "name": "...", "description": "...", "scoreCard": {...} }]
}
```

### GET /api/decisions

获取决策列表（需登录）。

**Query params:** `?tag=food&page=1&limit=20`

### GET /api/decisions/[id]

获取单个决策详情。

### PATCH /api/decisions/[id]

更新决策（如选定选项、标记完成）。

**Request:**
```json
{
  "selectedOptionId": "uuid",
  "status": "COMPLETED"
}
```

---

## 房间模块

### POST /api/rooms

创建多人投票房间。

**Request:**
```json
{
  "title": "周末聚会去哪儿",
  "options": ["密室逃脱", "烧烤露营", "KTV"],
  "isAnonymous": false,
  "deadlineHours": 2
}
```

**Response:**
```json
{
  "shareCode": "ABC123",
  "shareUrl": "https://decidenow.app/room/ABC123",
  "deadline": "2026-05-30T16:00:00Z"
}
```

### GET /api/rooms/[code]

获取房间详情（含选项和当前票数）。

### POST /api/rooms/[code]/vote

投票。

**Request:**
```json
{
  "optionId": "uuid",
  "reason": "烧烤，我带酒"  // 可选
}
```

### POST /api/rooms/[code]/close

手动截止投票（仅发起人）。

---

## 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数有误 |
| 401 | 未认证（需要登录） |
| 404 | 资源不存在 |
| 410 | 房间已过期 |
| 500 | 服务端错误 |
