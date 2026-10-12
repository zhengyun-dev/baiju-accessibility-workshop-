# 模型使用清单（合规申报，填报进提交材料）

> 依据公告第 3 条：提交时须如实填写作品使用的**全部模型**——名称、版本、提供方、使用环节、调用方式。

| 模型名称 | 版本 | 提供方 | 使用环节 | 调用方式 |
|---|---|---|---|---|
| **Agnes-3.0** | flash | Agnes 自研（组委会统一发放 Key） | ② 白话翻译生成、③ 知识卡生成（**Agnes 参与核心任务**） | AGH Skill 机制：模型在 agent 循环中被 Skill 激活并生成；调用经 AGH 网关 `https://api.agnes-ai.cn/v1`，协议 openai-completions |

## 说明

- **本项目核心任务的组织、执行、工具调用全部在 Agnes Harness（AGH）内完成**（公告第 2 条）。
- **两个 Agnes Skill**（`translate-to-plain` / `gen-knowledge-cards`）在 AGH 会话中被激活，由 **agnes-3.0-flash 模型实际生成**白话译文与知识卡——AGH 执行记录见 `AGH_EXECUTION_RECORDS.md`（可供人工核查）。
- **三个确定性工具**（① parse_text / ④ verify_sources / ⑤ readability_score）是 AGH 插件内的确定性计算，**不调用模型**（纯 JS 逻辑 + 词表/知识库匹配），保证可复现。
- **未使用**其它任何第三方商业模型；未自行接入其它开源模型。
- 本清单未包含任何模型 Key（遵守公告第 5 条，敏感信息不入材料）。

## 调用留痕（可核查）

| 证据文件 | 内容 | 证明 |
|---|---|---|
| `sources/02_clean/skill_trace/skill_trace_2_translate.txt` | ② 白话翻译的 AGH 终端执行记录 | 终端 `- tool skill_read · ok`（Skill 被激活，非凭记忆），输出 `translator=agnes-3.0-flash` |
| `sources/02_clean/skill_trace/skill_trace_3_cards.txt` | ③ 知识卡的 AGH 终端执行记录 | 终端 `- tool skill_read` + `- tool read`（读了知识库文件再匹配） |
