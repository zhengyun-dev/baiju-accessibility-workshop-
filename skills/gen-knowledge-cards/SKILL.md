---
name: gen-knowledge-cards
description: 从南京白局知识库提取典故/地名条目，生成带来源 URL 的知识卡，无来源降级"待考"
version: 1.0.0
author: 白局·无障碍唱词工坊
---

# 白局典故知识卡生成 Skill

## 任务
用户给出白局唱词里提到的**南京典故关键词**（地名、小吃、人物、典故名），本 Skill 让 Agnes 模型**只依据本地知识库** `sources/knowledge_base/nanjing_landmarks.md` 生成带来源 URL 的知识卡。

## 严格规则（合规 3.4）
1. **只引用知识库已有内容，不编造**：模型读 `sources/knowledge_base/nanjing_landmarks.md`，按关键词匹配（子串/语义），提取该条目 → 生成卡片。
2. **每张卡必须带来源 URL**：知识库块里的 `来源：xxx` 行直接作为卡片的 `source` 字段。无来源 → `source: "(无来源，待考)"`，卡片降级为"待考"状态。
3. **无命中 → 不编造**：关键词在知识库查不到任何块，返回 `status: "miss"` + `cards: []`，绝不臆造典故。
4. **忠实知识库表述**：知识库若注明"名实不一/位置不可考"（如白鹭洲），卡片原样保留该注记，不替它圆谎。
5. **文化密度标注**：卡片可附加 `properNounCount`（专名数）供后续量化，但**专名不计入"难词"**。

## 输入
- `kbPath`：知识库文件路径（如 `sources/knowledge_base/nanjing_landmarks.md`）
- `keywords`：典故关键词数组（如 `["朱雀桥","乌衣巷","白鹭洲","媚香楼","夫子庙","秦淮"]`）

## 知识库结构
知识库 `nanjing_landmarks.md` 用 `## 标题` 分块，每块 = 一个知识点：
```
## 朱雀桥（六朝秦淮浮桥）
<3-5 句可溯源介绍>
来源：<URL 或 素材编号>
```

## 执行方式（两种，二选一）
- **Agnes 模型生成**（本 Skill 主路径）：模型读知识库 + 关键词，按上述规则生成卡片 JSON。**这是"Agnes 参与核心任务"的真实证据**。
- **规则兜底**：确定性脚本（按行扫 `## ` 切块 + 子串匹配），见 `plugins/hot-tool-plugin/index.mjs` 里 `gen_knowledge_cards` Tool（保留作离线对照）。

## 输出（JSON）
```json
{
  "totalKeywords": 9,
  "hitKeywords": 8,
  "cards": [
    {
      "keyword": "朱雀桥",
      "cardCount": 2,
      "status": "hit",
      "cards": [
        { "topic": "朱雀桥（六朝秦淮浮桥）", "intro": "...", "source": "https://zh.wikipedia.org/zh-hans/朱雀桥" }
      ]
    },
    { "keyword": "十里秦淮", "cardCount": 0, "status": "miss", "cards": [] }
  ]
}
```

## 验收
- 知识卡溯源率 ≥ 80%（`verify_sources` 工具核验，见 Tool）
- 每卡有来源 URL 或明确标"待考"
- 无命中时 100% 不编造
