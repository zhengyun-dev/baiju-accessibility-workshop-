import { textStatsTool } from './index.mjs'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const registered = []
textStatsTool.apply({
  extension: () => ({
    registerTool: (t) => registered.push(t),
    on: () => {},
    ctx: { log: { info: () => {} } },
  }),
})

const tool = registered.find((t) => t.name === 'gen_knowledge_cards')
// 用绝对路径（node -e 的 cwd 是仓库根，不在 hot-tool-plugin 里，相对路径会错）
const kbPath = new URL('../../../sources/knowledge_base/nanjing_landmarks.md', import.meta.url).pathname
console.log('知识库绝对路径 =', kbPath)
const r = await tool.execute({ kbPath, keywords: ['夫子庙', '莫愁湖', '云锦机房', '不存在的词'] })
console.log('hitKeywords =', r.structured.hitKeywords, '/', r.structured.totalKeywords)
for (const c of r.structured.cards) {
  console.log('  关键词「' + c.keyword + '」→ status:', c.status, '| 命中卡数:', c.cardCount)
  for (const card of c.cards) {
    console.log('     ·', card.topic, '| 出处:', card.source.slice(0, 40))
  }
}
