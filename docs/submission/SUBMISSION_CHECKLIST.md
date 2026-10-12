# 提交清单（ZIP 里该放什么，对照公告第 3 条）

> 作品文件统一命名：`组别-参赛编号-队伍名称-队长姓名.zip`
> 例：`本科生组-U023-智创队-张三.zip`
> **参赛编号在发放 Agnes Key 时一并邮件发送，勿自行修改。**

## 仓库

- **GitHub 仓库**：<https://github.com/zhengyun-dev/baiju-accessibility-workshop>
- 状态：已推 main（65 文件，约 620KB）。⚠ 请确认仓库名末尾无多余点；若实际带尾点请在 GitHub Settings→Rename 去掉。

## 待你补全的占位信息

| 字段 | 值（替换后填 ZIP 文件名） |
|---|---|
| 组别 | 本科生组（高校组） |
| 参赛编号 | `______`（邮件里拿到的，如 U023） |
| 队伍名称 | `______` |
| 队长姓名 | `______` |

→ ZIP 文件名 = `本科生组-<参赛编号>-<队伍名称>-<队长姓名>.zip`

## ZIP 内目录结构（= 本仓库真实结构）

```
本科生组-U023-智创队-张三.zip
├── README.md               # 作品说明（5 能力架构 / 怎么跑 / 双指标 / 仓库 URL）
├── .gitignore
├── plugin/                 # AGH 插件：①parse_text ④verify_sources ⑤readability_score + 词表
│   ├── index.mjs           #   3 个 Tool 注册
│   ├── data/dialect_words.json  #   361 词三层词表（⑤ 主数据源）
│   ├── demo_all.mjs        #   机房苦 ①→⑤ 全链路（落 validation_report_c05.json）
│   ├── demo_run.mjs        #   最小闭环
│   ├── test_3categories.mjs   # 三类样例 normal/boundary/failed
│   ├── test_kb.mjs         # ③ 知识库命中测试
│   ├── package.json
│   └── validation_report.md
├── skills/                 # ②③ 两个 AGH Skill（Agnes 模型生成）
│   ├── translate-to-plain/SKILL.md
│   └── gen-knowledge-cards/SKILL.md
├── data/                   # 全部素材
│   ├── 01_raw/             # 原始唱词 b01–b06
│   ├── 02_clean/          # 清洗逐句 c01–c06 + skill_trace/ + 验证 JSON（_readability / _c05）
│   ├── 03_knowledge/      # 背景 k01–k09
│   ├── 04_tests/          # 三类测试样例 + 存疑反馈分支
│   ├── knowledge_base/    # 10 张典故卡 nanjing_landmarks.md
│   ├── sources_manifest.csv   # 素材登记表（全部带 URL）
│   └── dialect_words_supplement.md
├── web/web-ui/            # 纯静态 Web 演示（双击 index.html 即用，无需后端）
└── docs/
    ├── validation_report_full.md   # 完整验证报告
    ├── demo_video/                # 演示视频脚本（PITCH/SCRIPT/SHOOTING_CUE/QA；视频本体阶段3录）
    └── submission/                # 本清单 + AGH 执行记录 + 模型声明
```

## 必备材料核对（公告逐条打勾）

- [x] 作品用 **AGH 完成核心任务组织/执行/工具调用**（公告2）→ 2 Skill + 3 Tool
- [x] **如实填全部模型**（公告3）→ `docs/submission/MODEL_DECLARATION.md`
- [x] **AGH 执行记录，可人工核查**（公告3）→ `docs/submission/AGH_EXECUTION_RECORDS.md` + `data/02_clean/skill_trace/`
- [ ] **演示视频**（公告3）→ `docs/demo_video/`（脚本已备，**视频本体阶段3录制**）
- [x] 验证材料 → `plugin/validation_report.md` + `data/04_tests/`
- [x] 第三方代码/数据**如实说明来源与使用方式**（公告5）→ 词表/知识库/素材均带来源 URL
- [x] **未暴露任何 Key/密码**（公告5）→ 提交前 grep 全材料无 `sk-` 敏感串
- [ ] 命名规范：`组别-参赛编号-队伍名称-队长姓名.zip`（参赛编号/队伍/队长姓名 待补）

## 打包命令（所有材料齐后）

```bash
cd /home/yunnn/baiju-accessibility-workshop
# 先在上表把 参赛编号/队伍/队长姓名 填好，拼出文件名
zip -r "本科生组-<参赛编号>-<队伍名称>-<队长姓名>.zip" . -x "*/node_modules/*" "*.DS_Store" "*/.git/*"
ls -lh *.zip   # 确认 ≤200MB（当前仓库仅 ~620KB，远低于上限）
```

> 提交前必做安全检查：
> ```bash
> grep -rniE "sk-[A-Za-z0-9]{10,}|api[_ ]?key\s*[:=]" . --include='*' | grep -v "AGNES_API_KEY 环境变量占位"
> ```
> 应无真实 Key 泄露。
