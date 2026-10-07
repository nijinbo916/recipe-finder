# Recipe Finder · 菜谱搜索器

> Web 开发技术 · 第二次课作业（第 2 周）—— 按课程视频 `5-1 ~ 5-4 菜单搜索器` 的形态实现：
> **用 `fetch` 调 TheMealDB 公共接口**，做「搜索列表 → 点击看详情」的菜谱搜索页。

## 在线预览

- **Vercel 线上地址**：<待部署后填写>
- **GitHub Pages 备用地址**：<待开启后填写>
- **GitHub 仓库地址**：<待填写>

> 本页依赖 TheMealDB 公共接口，需要联网才能查到数据。

## 功能

| 功能 | 说明 |
| --- | --- |
| 关键字搜索 | 输入菜名或关键词（chicken / beef / pasta…），点 **Search** 或按 **Enter** |
| 快捷标签 | 搜索框下方 5 个常用关键词，点一下直接搜 |
| 结果列表 | 卡片网格展示菜名、缩略图、分类胶囊 |
| 菜谱详情 | 点卡片 → `lookup.php` 拉详情：大图、产地与标签、分类、做法步骤、配料表、YouTube 视频按钮 |
| 返回列表 | 详情页 **Back to recipes** 按钮回到搜索结果 |
| 各种兜底 | 空关键词提示、搜不到结果提示、接口异常提示（含联网排查提示）、搜索中的加载动画 |
| 键盘操作 | `Enter` 搜索 ｜ `Esc` 清空输入框 |
| 响应式 | 桌面多列网格，手机单列、搜索框与按钮纵向堆叠 |

## 目录结构

```
recipe-finder/
├── index.html     页面结构（搜索区 / 结果区 / 详情区）
├── style.css      样式（CSS 变量、卡片网格、详情页、加载动画、响应式）
├── script.js      逻辑（fetch 搜索 / 拉详情 / 渲染 / 状态切换）
└── README.md
```

## 实现要点

**接口**（TheMealDB，免费公共 API）

```
搜索：https://www.themealdb.com/api/json/v1/1/search.php?s=关键词
详情：https://www.themealdb.com/api/json/v1/1/lookup.php?i=菜品ID
```

**关键实现**

1. **`async / await + fetch`** —— 搜索与详情两个异步流程，全程 `try / catch` 兜底，失败给出可读提示而不是白屏
2. **状态切换靠 `.hidden` 类** —— `#meals`（列表）、`#meal-details`（详情）、`#result-heading`、`#error-container` 四个区块互斥显示
3. **事件委托** —— 卡片是搜索后才生成的，点击事件绑在父容器 `#meals` 上，用 `e.target.closest(".meal")` 找到对应卡片，再读它的 `data-meal-id`
4. **配料表拼装** —— 接口把配料摊平成 `strIngredient1..20` 与 `strMeasure1..20` 两组字段，代码循环 1~20 拼成数组，跳过空项、`trim()` 掉多余空格
5. **`escapeHtml()`** —— 接口返回的文本要拼进 `innerHTML`，先转义再插入，避免文本里的 `<` `>` 破坏页面结构
6. **`encodeURIComponent()`** —— 关键词进 URL 前先编码，支持空格和中文

## 本地运行

`fetch` 不能跨 `file://` 协议工作，需要用本地服务器打开：

```bash
# 任选其一，在项目目录下执行
python -m http.server 8080
npx serve .
```

然后浏览器打开 `http://localhost:8080`。

## 部署

纯静态项目，无构建步骤：

1. 推送到 GitHub 仓库
2. Vercel 导入该仓库 → Framework Preset 选 **Other** → 其余默认 → Deploy
3. 仓库 **Settings → Pages** → Source 选 `Deploy from a branch` → Branch 选 `main` + `/ (root)` → Save（得到一个可直连的 `github.io` 备用地址）
