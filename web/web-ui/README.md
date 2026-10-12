# 白局·无障碍唱词工坊 · Web 演示

纯静态网页（`index.html` + `app.js` + `lib/*.js`），浏览器直接开，无需后端、无需 API key。

## 怎么开

**方式一：双击 `index.html`**（大多数现代浏览器）

**方式二：起个本地静态服务**
```bash
cd ui
python3 -m http.server 8080
# 浏览器开 http://localhost:8080
```

## 能做什么

- 粘贴南京白局唱词（一行一句，可直接贴 B 站字幕）
- **① 分析唱词**：分句 + 命中方言词标记
- **②③④⑤ 一键全链路**：白话翻译对照 + 知识卡 + 来源核验 + 可读性报告

## 两种"生成"（要分清）

| 能力 | 本页里跑的是什么 |
|---|---|
| ①④⑤ | **确定性计算**（浏览器直接跑），结果即最终结果 |
| ②③ | **离线演示模式**（确定性替换 + 知识库匹配），非真 Agnes 生成 |

②③ 想升级成**真 Agnes 生成**，见 `../plugin/`：把 ②③ 两个 Skill（`SKILL.md`）接到 AGH，或在 `plugin/demo_all.mjs` 里配置 `AGNES_API_KEY` 走网关。

## 数据从哪来

- `lib/dialect_data.js`：359 词南京方言词表（含 31 个粗俗词单列）+ 21 条来源登记表（带 URL）
- `lib/kb_data.js`：10 张典故卡（朱雀桥/乌衣巷/白鹭洲/媚香楼等）

改词表/来源/知识卡，改 `plugin/data/dialect_words.json` 和 `sources/sources_manifest.csv`，重跑 `lib` 生成脚本即可，**不用改前端代码**。
