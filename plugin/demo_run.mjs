// 最小闭环验证：加载 hot-tool-plugin，注册工具 → 调用 → 拿到反馈。
// 用法：node examples/packages/hot-tool-plugin/demo_run.mjs
// 说明：真实 AGH 里 ctx.extension() 由 AGH 注入；这里用一个 mock ctx 模拟，
//       只为验证"插件注册→工具执行→结构化返回"这条链路能走通，截图用。
import { textStatsTool } from './index.mjs'
import { readFileSync } from 'node:fs'

// ---- 构造一个最小的 mock extension，捕获 registerTool / on / log ----
const registered = []
const mockCtx = {
  extension() {
    return {
      registerTool(t) {
        registered.push(t)
        console.log(`[规划→注册] 已注册工具：${t.name}  (readOnly=${t.meta.isReadOnly}, approval=${t.meta.requiresApproval})`)
      },
      on(_ev, _h) {},
      ctx: { log: { info: (m) => console.log('[log]', m) } },
    }
  },
}

// ---- 1. 应用插件：触发工具注册 ----
console.log('\n===== 第 1 步：插件 apply（注册工具） =====')
textStatsTool.apply(mockCtx)

// ---- 2. 调用工具：喂一句 02_clean 的白局唱词 ----
console.log('\n===== 第 2 步：调用 split_sentences（喂 c01 唱词）=====')
const c01Text = readFileSync(new URL('../../../sources/02_clean/c01_b01_nan_jing_mei_jing.txt', import.meta.url), 'utf8')
// 取正文（跳过 # 注释行），模拟"规划"：把清洗后的唱词喂给工具
const body = c01Text.split('\n').filter((l) => !l.startsWith('#') && l.trim()).join('\n')

const splitTool = registered.find((t) => t.name === 'split_sentences')
const res = await splitTool.execute({ text: body })
console.log('[调用→反馈]', res.structured)

// ---- 3. 再调一次 demo_text_stats，证明原工具也没坏 ----
console.log('\n===== 第 3 步：调用 demo_text_stats（原文字统计）=====')
const statsTool = registered.find((t) => t.name === 'demo_text_stats')
const res2 = await statsTool.execute({ text: body })
console.log('[调用→反馈]', res2.structured)

// ---- 4. 调 parse_text（nodejieba 分词 + 方言词标记，10.09 工具①）----
console.log('\n===== 第 4 步：调用 parse_text（nodejieba 分词 + 方言词标记）=====')
const parseTool = registered.find((t) => t.name === 'parse_text')
const res3 = await parseTool.execute({ text: body })
console.log('[调用→反馈] segmenter =', res3.structured.segmenter)
console.log('[调用→反馈] 逐句分词 + 方言词命中：')
for (const p of res3.structured.parsed) {
  console.log(`  ${p.sentence}  →  words: [${p.words.join(' / ')}]  dialect: [${p.dialectHits.join('、')}]`)
}

// ---- 5. 调 translate_to_plain（10.09 工具②；有 AGNES_API_KEY 走真 Agnes，无 key 自动降级）----
console.log('\n===== 第 5 步：调用 translate_to_plain（白局唱词→白话）=====')
const translateTool = registered.find((t) => t.name === 'translate_to_plain')
const res4 = await translateTool.execute({ text: body })
console.log('[调用→反馈] translator =', res4.structured.translator)
for (const t of res4.structured.translated) {
  console.log(`  原：${t.sentence}`)
  console.log(`  译：${t.plain}`)
}

console.log('\n===== 闭环走通：注册 → 调用 → 反馈，共', registered.length, '个工具 =====')
