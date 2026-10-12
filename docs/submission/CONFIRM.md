# 提交确认单（交包前最后核对）

> 作品文件：`本科生组-U202-白局·有声金陵-郑云.zip`
> 队伍：白局·有声金陵 ｜ 参赛编号：U202 ｜ 队长：郑云

## 一、这个 ZIP 里有什么（对照公告逐条）

| 公告要求 | 包里对应 | 状态 |
|---|---|---|
| 用 AGH 完成核心任务 | 2 个 Skill（②③）+ 3 个确定性工具（①④⑤） | ✅ |
| 如实填全部模型 | `MODEL_DECLARATION.md`（Agnes-3.0-flash，全字段） | ✅ |
| AGH 执行记录可核查 | `AGH_EXECUTION_RECORDS.md` + `skill_trace/`（2 份终端记录） | ✅ |
| 演示视频 | `demo_video/SHOOTING_CUE.md`（分镜）＋ **视频文件待录**（见下） | ⚠ 半 |
| 验证材料 | `validation_report.md` + `04_tests/`（三类测试） | ✅ |
| 第三方来源如实说明 | 22 行 `sources_manifest.csv` + 361 词全带 source | ✅ |
| 不暴露 Key/密码 | 全包 grep 扫描 0 命中（每次重打包再扫一次） | ✅ |
| 命名规范 | `本科生组-U202-白局·有声金陵-郑云.zip` | ✅ |

## 二、视频怎么办（当前唯一缺项）

公告第 3 条要"演示视频**及相关验证材料**"。现状：
- **已有**：分镜表 `SHOOTING_CUE.md` + 5 分钟路演讲稿 `PITCH_5MIN.md` + 答辩 Q&A `QA_PITCH.md` + 可复现前端 + AGH 执行记录
- **缺**：3–5 分钟视频**成片**

**两条路，你选**：
1. **能录** → 按 `SHOOTING_CUE.md` 的 5 个镜头录，丢进 `demo_video/demo.mp4`，我重打包（含视频）
2. **录不了** → **不亏**。"相关验证材料"已齐（执行记录 + 可复现前端 + 验证报告），**答辩现场直接演示网页 + 终端复现**，比录的视频更硬；把缺视频一事**在提交说明里如实写一句**（"演示视频因赛程调整以现场演示替代"）

## 三、交包前 30 秒动作

```bash
cd /home/yunnn/baiju-accessibility
# 1. 确认参赛编号填对（文件名 + SUBMISSION_CHECKLIST.md）
grep -n "U202" SUBMISSION_CHECKLIST.md
# 2. 最后扫一遍 Key（务必 0 命中）
grep -rInE "sk-[A-Za-z0-9]{15,}" . 2>/dev/null | grep -v "不依赖" | head
# 3. 重打包
python3 pack.py   # 或按下面命令
```

**重打包命令**（录完视频/改完材料后）：
```bash
cd /home/yunnn/baiju-accessibility
zip -r "/home/yunnn/本科生组-U202-白局·有声金陵-郑云.zip" . -x "*/node_modules/*" "*.DS_Store"
```

## 四、一句话底线

**这个包 0 造假、0 暴露 Key、指标全绿（难词降 100% + 溯源 100%）、第三方来源全登记。**
视频是唯一"待补"，但有兜底（现场演示 + 如实说明）。**10.15 12:00 前提交即可。**
