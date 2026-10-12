# 白局·无障碍唱词工坊 · 验证报告

> 项目：南京白局（非遗）唱词 → 可读白话 + 可溯源知识卡 + 可读性报告
> 生成日期：2026-10-08 | 环境：AGH local-dev，模型 agnes-3.0-flash
> 合规基线：规则 3.4（引用必带 URL，不编造，存疑不硬译）

---

## 一、能力架构（Tool / Skill 分层，对应规则 3.1）

| 编号 | 能力 | 形态 | 角色 |
|---|---|---|---|
| ① | parse_text（分句 + nodejieba 分词 + 方言标记） | **Tool** | 确定性解析 |
| ② | translate-to-plain（逐句白话翻译，方言标存疑） | **Skill**（Agnes 生成） | 模型参与核心任务证据 |
| ③ | gen-knowledge-cards（知识库 → 典故卡 + 来源 URL） | **Skill**（Agnes 生成） | 模型参与核心任务证据 |
| ④ | verify_sources（来源编号/URL → 溯源率） | **Tool** | 确定性核验 |
| ⑤ | readability_score（原文 vs 白话 难词率对比） | **Tool** | 确定性量化 |

**Skill vs Tool 的边界**（答辩口径）：②③ 是"给 Agnes 模型的指令"，模型在 agent 循环里**真的生成**白话/卡片 → 这就是"Agnes 参与核心任务"铁证；①④⑤ 是确定性计算，构成"工具调用链"证据。

---

## 二、两个硬指标（阶段 1 落地）

### 指标 A：知识卡溯源率 ≥ 80%
- **实测：100%**（20/20 张命中卡全部带来源 URL，维基/k0x 编号）
- 工具：④ verify_sources；证据：`sources/02_clean/validation_report_c05.json`

### 指标 B：难词率下降（白话版 < 原文 50%）
- **实测：《机房苦》原文 2.9% → 白话 0%，下降 100%**
- 工具：⑤ readability_score；**词表外置**到 `plugin/data/dialect_words.json`（新增方言词只改 JSON 不改代码），三层桶：
  - **难词（dialectWords）**：命中南京方言俚语（坐板疮/削灵/靸/腰子箩/么得…）→ 白话替换后命中≈0
  - **harmony（谐音双关）**：针好/顶好，本意游客可懂，**不计难词**
  - **proper（文化专名）**：机房/夫子庙/秦淮/老菱…，单列文化密度，**不计难词**
- **v4 子串去重**：难词互为子串时只按最长词计数（如"鸡头果"⊂"鸡头果儿"不双计）
- **AGH 安装态兜底**：JSON 读不到时用内置 FALLBACK 词表，保证 ⑤ 永远能跑（两态行为一致）
- 证据：`sources/02_clean/readability_demo_c05.json`、`validation_report_c05.json`（`wordlistSource: data/dialect_words.json`）

---

## 三、Agnes 模型真实调用铁证（"Agnes 参与核心任务"）

| 能力 | 证据 | 关键 Trace |
|---|---|---|
| ② 白话翻译 | `skill_trace/skill_trace_2_translate.txt` | 终端 `- tool skill_read · ok`（Skill 被激活，非凭记忆） |
| ③ 知识卡 | `skill_trace/skill_trace_3_cards.txt` | 终端 `- tool skill_read` + `- tool read`（读了知识库文件再匹配） |

**逐句覆盖率 100%**：② 输入《机房苦》6 句 → 输出 6 句白话，行数一致。
**存疑标注 100% 不硬译**：坐板疮/焦头鸡/生活 均标 `（存疑：…）`，Agnes 未编造释义。

---

## 四、三类测试样例（normal / boundary / failed，各 ≥1）

证据：`sources/04_tests/three_category_tests.json`

| 类型 | 用例 | 结果 | 结论 |
|---|---|---|---|
| **normal** | c05 机房苦（正常唱词） | 34 句；⑤ 降 100% pass | ✅ 全链路正常 |
| **boundary** | "草帽么得边儿——顶好"（歇后语谐音） | `harmony:1`（顶好归谐音双关）、`hardWords:[么得]` | ✅ 谐音词正确剔除难词 |
| **failed** | "不存在的典故"+ 无来源卡 | 该词 `traceable=no` 降级"待考"，不崩溃 | ✅ 降级正确 |

**boundary 是关键**：证明 ⑤ 真把"顶好"识别为歇后语谐音（不计难词），而"么得"（方言俚语）判为难词。

---

## 五、存疑反馈分支（合规 3.4 闭环）

证据：`sources/04_tests/doubt_feedback_flow.md` + `pending.json`

- ② 标出的存疑词进入 `pending.json`：
  - 坐板疮 → **resolved**（已并入方言词表）
  - 焦头鸡 / 生活 / 削灵 / 靸 → **pending + 待考**（无公开来源，不硬编）
- 歇后语双关词（针好/顶好）单列 harmony，**不进 pending**。
- 流程：发现 → 登记 → 查来源 → 回填 `dialect_words_supplement.md` → 销项。

---

## 六、素材盘点（合规 3.4：0 未抓取）

- **唱词** 6 段：c01 南京美景 / c02 说好六千 / c03 智斗鼠引子 / c04 我的家乡 / c05 机房苦 / c06 金陵游
- **背景知识** 9 份：k01–k09（非遗网、百科、市政府、光明日报、知乎、维基×4）
- **知识库** 10 张卡：`nanjing_landmarks.md`（含 4 张维基新卡 朱雀桥/乌衣巷/白鹭洲/媚香楼）
- **manifest**：22 行，全部"已抓取"，无未抓取项
- 诚实标注：莫愁湖卡注明"地理典故素材未展开，待补公开来源"（不硬编）

---

## 七、遗留与风险

| 项 | 状态 | 应对 |
|---|---|---|
| ②③ 离线对照用 fallback | 真实生成已用 Agnes（skill_trace 铁证） | 答辩用 skill_trace，不用离线数据 |
| 莫愁湖地理典故未展开 | 标"待考" | 如需补，找公开来源，不编 |
| 焦头鸡/生活/削灵/靸 词源 | pending 待考 | 补公开来源后销项 |
| API key 曾明文暴露 | — | 答辩前重置 key |

---

## 附：证据文件索引

- 阶段1 全链路：`sources/02_clean/validation_report_c05.json`
- Agnes 铁证：`sources/02_clean/skill_trace/skill_trace_2_translate.txt`、`skill_trace_3_cards.txt`
- 难词率：`sources/02_clean/readability_demo_c05.json`
- 三类测试：`sources/04_tests/three_category_tests.json`
- 存疑分支：`sources/04_tests/doubt_feedback_flow.md`、`pending.json`
- 知识库：`sources/knowledge_base/nanjing_landmarks.md`
- 素材登记：`sources/sources_manifest.csv`
