# hot-tool-plugin（第三方插件给模型加工具，新插件机制）

`hot-tool` 的新写法：不再用 `agnes.extensions`（第三方旧式扩展包在运行时不生效），而是一个普通的
Cordis 插件，通过 `ctx.extension()` 注册工具与观察类钩子。

## 写法

`package.json` 用 `agnes.plugins` 声明入口，并声明 `inject: ["extension"]`：

```json
"agnes": { "plugins": [{ "export": "textStatsTool", "id": "ext:agnes-examples/hot-tool-plugin", "inject": ["extension"] }] }
```

`index.mjs` 导出一个对象插件：`inject: ['extension']`，`apply(ctx)` 里 `const agnes = ctx.extension()`，
再 `agnes.registerTool(...)`、`agnes.on('session_start', ...)`。没有任何 import，所以安装后的快照不需要解析依赖（工具参数是打了 TypeBox 标记的 JSON Schema，见文件里的注释；
未打标记的普通 JSON Schema 会在模型调用时被判为参数不合法）。

## `ctx.extension()` 能做什么

- `registerTool(def)`：工具由 Host 盖章来源（`plugin/<哈希>`）与包身份，插件不能自报；工具名不能占用内置扩展的名字。
- `on(event, handler)`：只接受观察类事件（`session_start`、`request_error`、`compact`、`subagent_start`、
  `subagent_end`、`format_deviation`、`shutdown`），返回值被丢弃。
- `events.append(name, data)`：写账本事件 `x/plugin/<哈希>/<name>`。
- 不开放：槽位、服务、投影、资源、改写类钩子。

## 白局·无障碍唱词工坊：架构说明（答辩口径）

本项目把南京白局唱词转成「看得懂的白话 + 可溯源知识卡 + 可读性报告」的无障碍观赏包。

### 能力分层（AGH 标准约定）

| 类型 | 做什么 | 本项目对应 | 规则 3.1 角色 |
|---|---|---|---|
| **工具 Tool** | 确定性计算，注册进 AGH 由模型调用 | `parse_text`（①分句/分词/方言标记）、`verify_sources`（④溯源率）、`readability_score`（⑤难词率对比） | 评审要的「≥1 条工具调用链」证据 |
| **技能 Skill** | 给模型的指令/任务方法，模型在会话里执行 | `translate-to-plain`（②逐句白话翻译）、`gen-knowledge-cards`（③典故知识卡生成） | **Agnes 模型参与核心任务的证据** |

### 数据流（答辩演示链路）

```
唱词 (02_clean/c05_b05_jifangk.txt)
  → ① parse_text (Tool: 分句 + nodejieba 分词 + DIALECT_WORDS 标记)
  → ② translate-to-plain (Skill: Agnes 模型逐句白话翻译，方言处标"存疑")
  → ③ gen-knowledge-cards (Skill: Agnes 模型读 nanjing_landmarks.md 生成卡片)
  → ④ verify_sources (Tool: 溯源率 ≥80% 核验)
  → ⑤ readability_score (Tool: 难词率下降 >50% 量化)
```

### 两个硬指标（已落地）

- **知识卡溯源率**：100%（20/20 全可溯源，含维基 URL + k0x 编号）
- **难词率下降**：《机房苦》原文 2.9% → 白话 0%，**下降 100%**

## 验证

`packages/host/test/assemble/plugin-extension-example.test.ts`：装上这个包，模型调用 `demo_text_stats` 得到结果；
行被移除后工具消失。
