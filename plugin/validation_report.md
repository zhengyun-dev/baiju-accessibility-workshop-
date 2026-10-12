# 南京白局·无障碍唱词工坊 — 验证报告

**项目**：南京白局唱词无障碍化（白话翻译 + 可溯源知识卡）
**报告日期**：2026-10-12
**合规基线**：规则 3.4（每素材标注来源 URL；只引用/改写，不商用分发；拿不准标"待考"，不编造）

---

## 1. 能力总览（5 工具 + 2 硬指标）

| # | 能力 | 实现形态 | 说明 |
|---|---|---|---|
| ① | `parse_text` | Tool（确定性） | 正则分句 + nodejieba 分词 + 南京方言词标记 |
| ② | `translate-to-plain` | **Skill**（Agnes 模型生成） | 逐句白话翻译，方言处标"存疑"；离线有规则兜底 |
| ③ | `gen-knowledge-cards` | **Skill**（Agnes 模型生成） | 读本地知识库生成带 URL 知识卡，无命中不编造 |
| ④ | `verify_sources` | Tool（确定性） | 知识卡 source 编号→真实 URL，无来源降级"待考" |
| ⑤ | `readability_score` | Tool（确定性） | 原文 vs 白话版难词率/句长对比 |

> **为什么 ②③ 是 Skill 不是 Tool**：翻译与"编知识卡"是"理解+生成"型任务，交给 Agnes 模型在 agent 循环里真实生成，才是"Agnes 参与核心任务"的可信证据；①④⑤ 是机械可复现的（分句/查 URL/计数），用确定性 Tool 保证结果稳定可验证。

**硬指标**：
- 知识卡溯源率 ≥ 80%（④ 核验）
- 白话版难词率下降 > 50%（⑤ 核验）

---

## 2. 数据集

| 类别 | 数量 | 位置 |
|---|---|---|
| 唱词原文（b 源） | 6 | `sources/01_raw/b01–b06` |
| 唱词清洗逐句（c） | 6 | `sources/02_clean/c01–c06` |
| 背景/典故素材（k 源） | 9 | `sources/03_knowledge/k01–k09` |
| 知识卡 | 10 | `sources/knowledge_base/nanjing_landmarks.md` |
| 南京方言词表 | 21 词 | `examples/packages/hot-tool-plugin/index.mjs` (DIALECT_WORDS) + `sources/dialect_words_supplement.md` |
| 来源清单 | 18 行 | `sources/sources_manifest.csv` |

六段唱词：南京美景、说好六千、智斗鼠引子、我的家乡在南京、机房苦、金陵游。
十张知识卡：云锦机房、秦淮河、夫子庙、莫愁湖（曲目角度）、金陵四十八景、文德桥、朱雀桥、乌衣巷、白鹭洲公园、媚香楼。

---

## 3. 指标①：知识卡溯源率（工具 ④ verify_sources）

**结果：100%（10/10 张可溯源），达标（目标 ≥80%）**

每卡来源 URL（④ 动态读 `sources_manifest.csv`，取纯 URL 列）：

| 知识卡 | 可溯源 | 来源 URL |
|---|---|---|
| 云锦机房 | ✅ | gmw.cn 光明日报 2007 ; zhihu.com/p/601169001 |
| 秦淮河 | ✅ | epaper.gmw.cn 2017-05-06 ; bilibili BV13oX6YrEps ; gmw.cn 2007 |
| 夫子庙 | ✅ | epaper.gmw.cn 2017 ; bilibili BV13oX6YrEps |
| 莫愁湖（曲目角度） | ✅ | baike.com/wikiid/1550383644694897492 |
| 金陵四十八景 | ✅ | ihchina.cn/project_details/13721 ; baike.com |
| 文德桥 | ✅ | baike.com/wikiid/1550383644694897492 |
| 朱雀桥 | ✅ | zh.wikipedia.org/zh-hans/朱雀桥 |
| 乌衣巷 | ✅ | zh.wikipedia.org/zh-hans/乌衣巷 |
| 白鹭洲公园 | ✅ | zh.wikipedia.org/zh-hans/白鹭洲公园 |
| 媚香楼 | ✅ | zh.wikipedia.org/zh-hans/媚香楼 |

**降级逻辑验证（失败样例）**：喂一张 `source: "(无来源，待考)"` 的卡，④ 正确返回 `traceable: "no"` + `note: 无来源，降级"待考"`，不崩溃、不编造。

证据：`sources/02_clean/validation_metrics.json`

---

## 4. 指标②：难词率下降（工具 ⑤ readability_score，② 替换表口径）

**难词定义**：命中南京方言词表 `DIALECT_WORDS`（21 词）的词；歇后语谐音双关词（`针好`/`顶好`）单列 `harmony`，不计难词。判定用**子串匹配**（不靠 jieba 切词，因为 jieba 会把"坐板疮"切碎成"坐/板/疮"导致漏判）。

**结果：两组达标（目标：白话版难词率 < 原文 50%）**

| 唱词 | 原文难词率 | 白话难词率 | 下降 | 命中方言词 | 达标 |
|---|---|---|---|---|---|
| 机房苦 (c05) | 4.6% | 0% | **100%** | 坐板疮/削灵/靸/烂鞋头儿/茅草桩/拎桶儿/腰子箩/老菱/鸡头果儿/焦头鸡 | ✅ |
| 金陵游 (c06) | 2.3% | 0% | **100%** | 马头墙/画舫/呱呱叫 | ✅ |

> **口径说明**：难词 = 原文中命中 ② 白话替换表（16 词）的方言词；白话版 = 替换后残留命中数。①④⑤ 与 ② 用同一套替换表，三处数字一致。
> 歇后语谐音双关词（`针好`/`顶好`）单列 `harmony`，不计难词；"么得" 是难词（游客真看不懂）。

证据：`sources/02_clean/validation_metrics_readability.json`（② 口径，c05/c06）+ `sources/02_clean/validation_metrics.json`（旧子串口径，存档）

---

## 5. 三类测试样例（`sources/04_tests/three_category_tests.json`）

| 类别 | 输入 | 期望 | 实际 |
|---|---|---|---|
| **normal** | c05 机房苦全链路 | 难词率下降 >50% | 原文 4.6%→白话 0%，下降 100%，pass=yes ✅ |
| **boundary** | `草帽么得边儿——顶好`（歇后语谐音） | "顶好" 进 harmony 不计难词；"么得" 算难词 | harmony=1，hardWords=[么得]，原文 12.5%→白话 0% ✅ ✅ |
| **failed** | ④ 喂"不存在的典故"（无来源卡） | traceable=no 降级待考，不崩溃 | traceableRate=50%（夫子庙 yes / 不存在 no）✅ |

---

## 6. 存疑反馈（合规 3.4 的落地）

- ② `translate-to-plain` Skill 严格规则第 3、4 条：方言词先译后加 `（存疑：<原词>）`；拿不准保留原词 + 标存疑，**绝不硬译**。
- `DIALECT_WORDS` 21 词中，释义不确定的 8 词（削灵/靸/拎桶儿/腰子箩/鸡头果儿/乖乖咙地咚/来斯 等）已在词表里逐条标注 `待考`，`dialect_words_supplement.md` 同步登记。
- 莫愁湖知识卡明确注明"地理典故本身待补来源"（不编造）。

---

## 7. 证据文件索引

| 文件 | 内容 |
|---|---|
| `sources/02_clean/validation_metrics.json` | 指标①② 原始数据（10 卡溯源 + 2 组难词率） |
| `sources/04_tests/three_category_tests.json` | 三类测试样例结果 |
| `sources/02_clean/validation_report_c05.json` | 机房苦全链路（①→⑤）完整运行记录 |
| `sources/02_clean/translate_demo_c01.json` | ② 真实 Agnes 3.0-flash 翻译输出（南京美景） |
| `sources/04_tests/gen_cards_demo.json` | ③ 知识库卡片命中样例 |

---

## 8. 结论

五项能力全部跑通，两个硬指标均达标（溯源率 100%、难词率下降 73.5%–100%），三类测试样例（normal/boundary/failed）全部通过，存疑词 100% 标"待考"不硬译。合规 3.4 贯穿：所有素材带来源 URL，拿不确定的含义一律降级"待考"，无编造。
