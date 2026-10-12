# 南京白局·无障碍唱词工坊

把濒危非遗「南京白局」唱词（南京方言）转成 **看得懂的白话 + 可溯源典故知识卡 + 可读性量化报告**，
让听不懂南京话的听障者、外地游客、年轻人能无障碍欣赏白局。

> 合规基线（规则 3.4）：每个素材都标注来源 URL；只引用/改写，不商用分发；拿不准的含义一律标「待考」，不硬编。

## 五个能力（3 Tool + 2 Skill）

| # | 能力 | 形态 | 做什么 | 角色（规则 3.1） |
|---|---|---|---|---|
| ① | `parse_text` | Tool | 逐行分句 + nodejieba 分词 + 南京方言词标记 | 工具调用链证据 |
| ② | `translate-to-plain` | **Skill** | Agnes 模型逐句白话翻译，方言处标「存疑」 | **模型参与核心任务** |
| ③ | `gen-knowledge-cards` | **Skill** | Agnes 模型读知识库生成带 URL 的典故卡，无命中不编造 | **模型参与核心任务** |
| ④ | `verify_sources` | Tool | 知识卡来源编号 → 真实 URL，无来源降级「待考」 | 溯源率 ≥80% 核验 |
| ⑤ | `readability_score` | Tool | 原文 vs 白话版难词率/句长对比 | 难词率下降 >50% 核验 |

**为什么 ②③ 是 Skill、①④⑤ 是 Tool**：翻译和「编知识卡」是「理解 + 生成」型任务，交给 Agnes 模型在 agent 循环里真实生成（才是「Agnes 参与核心任务」的可信证据）；①④⑤ 是机械可复现的（分句 / 查 URL / 计数），用确定性 Tool 保证结果稳定、可验证。

## 两个硬指标（已落地）

| 指标 | 目标 | 实测 | 数据源 |
|---|---|---|---|
| 知识卡溯源率 | ≥ 80% | **100%**（10/10 张全可溯源） | `data/02_clean/validation_metrics.json` |
| 白话版难词率下降 | > 50% | **机房苦 100% / 金陵游 100%** | `data/02_clean/validation_metrics_readability.json` |

## 数据集

- **唱词 6 段**（`data/01_raw` b01–b06 → `data/02_clean` c01–c06）：南京美景、说好六千、智斗鼠引子、我的家乡在南京、机房苦、金陵游。
- **背景/典故 9 条**（`data/03_knowledge` k01–k09）：非遗网、快懂百科、南京市政府、光明日报 2007、知乎 + 维基 4 张（朱雀桥/乌衣巷/白鹭洲/媚香楼）。
- **知识卡 10 张**（`data/knowledge_base/nanjing_landmarks.md`）。
- **南京方言词表 361 词**（`plugin/data/dialect_words.json`）：3 层分桶——难词 / 歇后语谐音双关（不计难词）/ 文化专名（不计难词，单列文化密度）；全部带来源，粗俗词隔离登记。

## 目录结构

```
.
├── README.md               # 本文件（参赛主文档）
├── plugin/                 # 5 能力代码（①④⑤ Tool 在 index.mjs；词表在 data/）
│   ├── index.mjs           #   AGH 插件：注册 parse_text / verify_sources / readability_score
│   ├── data/dialect_words.json  #   361 词三层词表（⑤ 主数据源）
│   ├── demo_all.mjs        #   机房苦 ①→⑤ 全链路演示 + 验证
│   ├── demo_run.mjs        #   最小闭环（注册→调用→反馈）
│   ├── test_3categories.mjs    #   三类样例 normal/boundary/failed
│   ├── test_kb.mjs         #   ③ 知识库命中测试
│   └── validation_report.md    #   验证报告
├── skills/                 # ②③ 两个 Skill（Agnes 模型生成）
│   ├── translate-to-plain/SKILL.md
│   └── gen-knowledge-cards/SKILL.md
├── data/                   # 全部素材（唱词/背景/知识卡/词表/验证证据）
│   ├── 01_raw/  02_clean/  03_knowledge/  04_tests/
│   ├── knowledge_base/
│   ├── sources_manifest.csv        # 18 行来源清单（编号→URL）
│   └── dialect_words_supplement.md # 词表追加登记
├── web/web-ui/             # 网页演示（双击 index.html 即可，无需后端/API key）
│   ├── index.html  app.js  lib/(dialect_data.js / kb_data.js)
└── docs/
    ├── validation_report_full.md   # 完整验证报告
    ├── demo_video/                # 3-5 分钟演示视频脚本（PITCH/SCRIPT/SHOOTING_CUE/QA）
    └── submission/                # 提交清单 + AGH 执行记录 + 模型声明
```

## 怎么跑

### 网页演示（最简单，评审可直接看）
```bash
cd web/web-ui
# 浏览器双击 index.html，或：
python3 -m http.server 8080   # 开 http://localhost:8080
```
粘贴白局唱词（一行一句，可直接贴 B 站字幕）→ 点「分析」→ ①④⑤ 确定性计算、②③ 离线演示，一次出白话对照 + 知识卡 + 来源核验 + 可读性报告。

### 跑工具验证（①④⑤）
```bash
cd plugin
node demo_all.mjs        # 机房苦 ①→⑤ 全链路，落 validation_report_c05.json
node test_3categories.mjs   # 三类样例
node test_kb.mjs          # ③ 知识库命中
```

### 跑 ②③（Skill，真 Agnes 生成）
在 AGH 会话里加载 `skills/` 下两个 Skill，模型即按 SKILL.md 规则逐句翻译 / 生成知识卡（方言处标「存疑」、无来源标「待考」）。
离线对照见 `plugin/demo_all.mjs`（② 用替换表、③ 用知识库子串匹配）。

## 存疑反馈（合规 3.4 落地）
- ② 翻译：方言词先译后加 `（存疑：<原词>）`；拿不准保留原词 + 标存疑，**绝不硬译**。
- 词表里 8 个释义不确定的词（削灵/靸/拎桶儿/腰子箩/鸡头果儿/乖乖咙地咚/来斯 等）逐条标「待考」。
- 失败样例（喂无来源卡 / 查不到的典故）一律降级「待考」，不崩溃、不编造。

## 提交物（10.15 前）
按 `docs/submission/SUBMISSION_CHECKLIST.md` 打包：仓库（本目录）+ ≤200MB ZIP（命名：组别-参赛编号-队伍名称-队长姓名）+ 3-5 分钟演示视频。
