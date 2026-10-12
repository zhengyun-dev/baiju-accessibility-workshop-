# AGH 执行记录（可供人工核查）

> 公告第 3 条要求：上传"可供人工核查的 AGH 执行记录"。本文件是这些记录的**索引 + 证明方式**，原始记录在 `sources/02_clean/skill_trace/`。

## 这些记录证明什么

证明"核心任务的组织、执行、工具调用"确实在 **Agnes Harness（AGH）** 里发生，且 ②③ 由 **Agnes 模型真实生成**（非人写、非凭记忆）：

1. **AGH 会话里激活了 Skill**（不是模型"背答案"）——终端有 `- tool skill_read · ok` 行，说明 AGH 真的调用了 `skill_read` 工具去读 Skill 指令。
2. **AGH 会话里读了知识库文件**——③ 的记录有 `- tool read` 行，说明模型读了 `nanjing_landmarks.md` 再做典故匹配，不是凭空编。
3. **输出标注了真实模型**——② 结果里 `translator=agnes-3.0-flash`，指向实际生成方。

## 原始记录

| 记录文件 | 对应的能力 | 核查要点 |
|---|---|---|
| `sources/02_clean/skill_trace/skill_trace_2_translate.txt` | ② translate-to-plain | 找 `- tool skill_read · ok` + 输出 `translator` 字段 |
| `sources/02_clean/skill_trace/skill_trace_3_cards.txt` | ③ gen-knowledge-cards | 找 `- tool skill_read` + `- tool read`（读知识库） |

## 执行环境（可复现口径）

- AGH 开源项目：`https://github.com/AgnesAI-Labs/agnes-harness`
- 运行方式：AGH local-dev profile，AGH 会话内点名调用 Skill
- 模型：agnes-3.0-flash（Agnes 自研，组委会发放 Key）
- 时间：2026-10-08（开发日）

## 确定性工具的运行留痕（①④⑤ 不调模型，可离线复现）

①④⑤ 是 AGH 插件里的确定性计算，评委可**自己跑**核对，不依赖模型、不依赖 Key：

```bash
cd plugin && node demo_all.mjs        # 跑 ①→②离线→③离线→④→⑤ 全链路，生成验证 JSON
cd plugin && node test_3categories.mjs # 跑 三类测试样例
```
