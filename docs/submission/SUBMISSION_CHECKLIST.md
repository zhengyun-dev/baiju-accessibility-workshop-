# 提交清单（ZIP 里该放什么，对照公告第 3 条）

> 作品文件统一命名为：`组别-参赛编号-队伍名称-队长姓名.zip`
> 例：`本科生组-U023-智创队-张三.zip`
> **参赛编号在发放 Agnes Key 时一并邮件发送，勿自行修改。**

## 待你补全的占位信息

| 字段 | 值（替换后填 ZIP 文件名） |
|---|---|
| 组别 | 本科生组（高校组） |
| 参赛编号 | `______`（邮件里拿到的，如 U023） |
| 队伍名称 | `______` |
| 队长姓名 | `______` |

→ ZIP 文件名 = `本科生组-<参赛编号>-<队伍名称>-<队长姓名>.zip`

## ZIP 内目录结构（建议）

```
本科生组-U023-智创队-张三.zip
├── README.md                      # 作品说明（架构/怎么跑/能力分层）
├── MODEL_DECLARATION.md           # 模型使用清单（公告第3条必填）★
├── AGH_EXECUTION_RECORDS.md      # AGH 执行记录索引（"可供人工核查"）★
├── validation_report.md          # 验证报告（双指标 + 三类测试 + 存疑分支）
├── skills/                        # 两个 AGH Skill（②③，SKILL.md）
├── plugin/                        # AGH 插件（①④⑤ 工具 + 词表 data/）
├── ui/                            # 纯静态 Web 演示（双击即用）
├── sources/
│   ├── 01_raw/                    # 原始唱词 b01–b06
│   ├── 02_clean/                  # 清洗对齐 c01–c06 + skill_trace/ + 验证 JSON
│   ├── 03_knowledge/              # 背景资料 k01–k09
│   ├── 04_tests/                  # 三类测试样例 + 存疑反馈分支
│   ├── knowledge_base/            # 10 张典故卡
│   ├── sources_manifest.csv       # 素材登记表（0 未抓取，全部带 URL）
│   └── dialect_words_supplement.md
└── demo_video/                    # 演示视频（3–5 分钟，阶段3产出）
```

## 必备材料核对（公告逐条打勾）

- [ ] 作品用 **AGH 完成核心任务组织/执行/工具调用**（公告2）→ 两个 Skill + 插件工具链
- [ ] **如实填全部模型**（公告3）→ `MODEL_DECLARATION.md`
- [ ] **AGH 执行记录，可人工核查**（公告3）→ `AGH_EXECUTION_RECORDS.md` + `skill_trace/`
- [ ] **演示视频**（公告3）→ `demo_video/`（阶段3产出）
- [ ] 验证材料 → `validation_report.md` + `04_tests/`
- [ ] 第三方代码/数据**如实说明来源与使用方式**（公告5）→ 词表/知识库/素材均带来源 URL
- [ ] **未暴露任何 Key/密码**（公告5）→ 全材料 grep 无敏感串
- [ ] 命名规范：`组别-参赛编号-队伍名称-队长姓名.zip`

## 打包命令（待所有材料齐了）

```bash
cd /home/yunnn/baiju-accessibility
# 先按上面把 参赛编号/队伍/队长姓名 填进文件名
zip -r "本科生组-<参赛编号>-<队伍名称>-<队长姓名>.zip" . -x "*/node_modules/*" "*.DS_Store"
ls -lh *.zip   # 确认 ≤200MB
```
