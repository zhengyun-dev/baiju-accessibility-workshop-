// 阶段 2a：三类测试样例（normal / boundary / failed），各跑 ①②③④⑤ 相关断言。
// 离线可跑（② ③ 此处用 fallback 逻辑；真实 Agnes 生成见 skill_trace/）。
import { textStatsTool } from './index.mjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const _here = path.dirname(fileURLToPath(import.meta.url))
// 两树通用：向上找 c05 文件（仓库 sources/ 或 AGH 树 sources/）
const _c05 = ['../data/02_clean/c05_b05_jifangk.txt','../sources/02_clean/c05_b05_jifangk.txt','../../../sources/02_clean/c05_b05_jifangk.txt']
  .map((r)=>path.resolve(_here,r)).find((f)=>{ try{readFileSync(f);return true}catch{return false} })
const _out = _c05.replace(/c05_b05_jifangk.txt$/,'../04_tests/three_category_tests.json')
const _outDir = _c05.replace(/c05_b05_jifangk.txt$/,'../04_tests/')


const registered = []
textStatsTool.apply({ extension: () => ({
  registerTool: (t) => registered.push(t),
  on: () => {},
  ctx: { log: { info: () => {} } },
})})

const v1 = registered.find(t => t.name === 'parse_text')
const v4 = registered.find(t => t.name === 'verify_sources')
const v5 = registered.find(t => t.name === 'readability_score')

const results = {}
// ② 白话替换表（15 词，②③④⑤ 共用；方言词→普通话白话）
const REPL = {'坐板疮':'皮肤病','削灵':'薄薄的','靸':'拖','烂鞋头儿':'破旧的鞋','茅草桩':'茅草柱子','拎桶儿':'提桶','腰子箩':'腰间挂的箩筐','老菱':'菱角','鸡头果儿':'炒货零食','焦头鸡':'闷头不说话的老板','惛头鸡':'闷头不说话的老板','还课':'去上课','么得':'没有','马头墙':'翘头的山墙','画舫':'游船','呱呱叫':'很好'}

// ---------- 测试 1: normal（机房苦 全链路）----------
{
  const text = readFileSync(_c05,'utf8').split('\n').filter(l=>l && !l.startsWith('#')).join('\n')
  const r1 = await v1.execute({ text })
  // ② fallback 白话（替换成意思，词表用顶部 REPL）
  let plain = text
  for (const [k,v] of Object.entries(REPL)) plain = plain.split(k).join(v)
  const r5 = await v5.execute({ original: text, plain, replaceTable: REPL })
  results.normal = {
    input: 'c05 机房苦（正常唱词）',
    sentenceCount: r1.structured.sentenceCount,
    metric_readability: { originalHardRate: r5.structured.metric.originalHardRate, plainHardRate: r5.structured.metric.plainHardRate, drop: r5.structured.metric.hardDropPercent, pass: r5.structured.metric.pass },
    expect: '全链路正常，难词率下降 >50%',
  }
}

// ---------- 测试 2: boundary（歇后语谐音 "草帽么得边儿——顶好"）----------
{
  const boundary = '草帽么得边儿——顶好'
  const r5 = await v5.execute({ original: boundary, plain: '草帽子没有边缘——最好（顶好=最好，歇后语双关）', replaceTable: REPL })
  // 顶好 在 HARMONY_WORDS，应不计难词
  results.boundary = {
    input: '草帽么得边儿——顶好（歇后语谐音双关）',
    metric_readability: { originalHardRate: r5.structured.metric.originalHardRate, plainHardRate: r5.structured.metric.plainHardRate, harmony: r5.structured.detail.plain.harmony, hardWords: r5.structured.detail.original.hardWords },
    expect: '"顶好" 进 harmony（谐音双关不计难词），原文难词≈0（"么得"是方言词算难词）',
  }
}

// ---------- 测试 3: failed（知识库查不到的关键词 → miss 不编造）----------
{
  // ④ 喂一张"无来源"的卡，验证降级"待考"
  const r4 = await v4.execute({ cards: [
    { topic: '不存在的典故', source: '(无来源，待考)' },
    { topic: '夫子庙', source: 'b01；b04' },
  ]})
  results.failed = {
    input: '③ 查不到"不存在的典故" + ④ 无来源卡',
    verify_sources: { total: r4.structured.total, traceableCount: r4.structured.traceableCount, traceableRate: r4.structured.traceableRate },
    不存在的典故: r4.structured.verified.find(v=>v.topic==='不存在的典故'),
    expect: '"不存在的典故" traceable=no + 降级"待考"；夫子庙 traceable=yes（b01/b04）；不崩溃',
  }
}

console.log(JSON.stringify(results, null, 2))

// 存结果
const _outDir = _c05.replace(/c05_b05_jifangk.txt$/,'../04_tests/'); mkdirSync(_outDir, { recursive: true })
writeFileSync(_c05.replace(/c05_b05_jifangk.txt$/,'../04_tests/three_category_tests.json'), JSON.stringify(results, null, 2))
console.log('\n✅ 三类测试样例已存（相对 c05 的 ../04_tests/）')
