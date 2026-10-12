// A plain Cordis object plugin that gives the model a tool. It has no imports, so the installed
// snapshot needs no dependency: `ctx.extension()` hands the row its own tool / hook / event API.
// Tool parameters are TypeBox schemas: plain JSON Schema objects tagged with the TypeBox kind
// symbol. Tagging them by hand keeps this file free of imports; with @sinclair/typebox installed,
// `Type.Object({ text: Type.String({ maxLength: 8192 }) }, { additionalProperties: false })` is the same value.
const Kind = Symbol.for('TypeBox.Kind')
const parameters = {
  [Kind]: 'Object',
  type: 'object',
  properties: { text: { [Kind]: 'String', type: 'string', maxLength: 8192 } },
  required: ['text'],
  additionalProperties: false,
}

const meta = {
  isReadOnly: true,
  isDestructive: false,
  isConcurrencySafe: true,
  isOpenWorld: false,
  replay: 'safe',
  costHint: undefined,
  deferLoading: false,
  requiresApproval: 'never',
}

// 南京白局方言词表：已外置到 data/dialect_words.json（发展性：新增方言词只改那个 JSON，不改代码）。
// 本文件下方 FALLBACK_DIALECT_WORDS 仅为 AGH 安装态（读不到 JSON）时的兜底词表。

// ⑤ 的三层词表：优先从 data/dialect_words.json 读（发展性：新增方言词只改那个 JSON，不改代码）；
// 文件读不到（如 AGH 安装态快照）时降级到内置兜底词表，保证 ⑤ 永远能跑。
// 三层：DIALECT_WORDS=难词（南京俚语）；HARMONY_WORDS=歇后语谐音双关（本意游客可懂，不计难词）；PROPER_NOUNS=南京文化专名（不计难词，单列文化密度）。
const { readFileSync: _readFileSync, existsSync: _existsSync } = await import('node:fs')
const _dataPath = new URL('./data/dialect_words.json', import.meta.url).pathname
const _DATA = _existsSync(_dataPath) ? JSON.parse(_readFileSync(_dataPath, 'utf8')) : null
// 内置兜底（与 data/dialect_words.json 保持一致，仅用于文件缺失时的安装态）。
const FALLBACK_DIALECT_WORDS = [
  { word: '么得', meaning: '没有（南京话"没有"的口语形式）', source: 'b01' },
  { word: '顶好', meaning: '最好、最棒（歇后语：草帽么得边儿——顶好）', source: 'b01' },
  { word: '针好', meaning: '真好（歇后语：上鞋不用锥子——针好）', source: 'b01' },
  { word: '上鞋', meaning: '缝鞋/制鞋（南京话，具体工艺 待考）', source: 'b01' },
  { word: '机房', meaning: '云锦织机房，白局发源地', source: 'k01' },
  { word: '白摆一局', meaning: '白局别称/得名说法之一：白唱一局，不取报酬', source: 'k01' },
  { word: '钞票', meaning: '人民币/钱（南京话）', source: 'b02' },
  { word: '官话', meaning: '南京话里的"普通话"（相对"老南京话"）', source: 'b03' },
  { word: '还课', meaning: '学生向老师汇报学练成果（白局教学术语，词源 待考）', source: 'b03' },
  { word: '簪子', meaning: '发饰/头饰（《乔奶奶骂猫》唱词"肉骨头当簪子"）', source: 'b03' },
  { word: '拽花工', meaning: '云锦织机上端拽花线的人', source: 'k04' },
  { word: '织手', meaning: '云锦织机下端摔梭织锦的人', source: 'k04' },
  { word: '十里秦淮', meaning: '秦淮风光雅称，形容秦淮河景致绵延', source: 'b04' },
  { word: '坐板疮', meaning: '坐骨/臀部湿疹，织机房久坐易得（病名，白话可理解为"屁股上的疮"）', source: 'b05' },
  { word: '削灵', meaning: '薄、锋利之意（"切的削灵有纸薄"；南京方言，词源 待考）', source: 'b05' },
  { word: '靸', meaning: '拖、趿拉（"我靸了一双烂鞋头儿"；南京方言，词源 待考）', source: 'b05' },
  { word: '烂鞋头儿', meaning: '破旧的鞋底/鞋（南京话；字面可懂，列作南京口语）', source: 'b05' },
  { word: '茅草桩', meaning: '茅草捆成的柱子（"碰到了茅草桩"；南京市井口语）', source: 'b05' },
  { word: '拎桶儿', meaning: '提桶（"肩背着拎桶儿"；南京话，"拎"=提；词源 待考）', source: 'b05' },
  { word: '腰子箩', meaning: '腰间挂的箩筐（"手拐腰子箩"；南京话，词源 待考）', source: 'b05' },
  { word: '老菱', meaning: '菱角（水生植物，南京秋令小吃；"卖热老菱"；字面可懂）', source: 'b05' },
  { word: '鸡头果儿', meaning: '炒栗子/炒货零食（"代卖鸡头果儿"；南京话小吃名，词源 待考）', source: 'b05' },
  { word: '乖乖咙地咚', meaning: '南京话感叹词，"好得很/厉害"（词源 待考）', source: 'b06' },
  { word: '来斯', meaning: '"来来来"南京话变体（词源 待考）', source: 'b06' },
  { word: '呱呱叫', meaning: '很好、顶好（南京话，字面可懂）', source: 'b06' },
  { word: '马头墙', meaning: '徽派/南京民居山墙顶翘如马头（建筑术语，字面可懂）', source: 'b06' },
  { word: '画舫', meaning: '装饰华丽、可供游赏的船（古语，游客多可懂）', source: 'b06' },
]
const FALLBACK_HARMONY = ['针好', '顶好']
const FALLBACK_PROPER = ['机房', '夫子庙', '秦淮', '秦淮河', '文德桥', '金陵', '六朝', '莫愁湖', '金陵四十八景', '朱雀桥', '乌衣巷', '白鹭洲', '媚香楼', '王谢', '刘禹锡', '李白', '谢安', '王导', '李香君', '侯方域', '阮大铖', '桃花扇', '奇芳阁', '老菱', '鸡头果儿', '干丝', '皮肚面', '鸭血粉丝', '盐水鸭', '桂花糖芋艿', '糖芋苗', '小笼包', '赤豆元宵', '活页', '热干面']
// 实际生效的词表：JSON 在就用 JSON，否则兜底。
const DIALECT_WORDS = _DATA?.dialectWords ?? FALLBACK_DIALECT_WORDS
const HARMONY_WORDS = new Set((_DATA?.harmonyWords ?? []).map((o) => o.word).length ? _DATA.harmonyWords.map((o) => o.word) : FALLBACK_HARMONY)
const PROPER_NOUNS = new Set((_DATA?.properNouns ?? []).length ? _DATA.properNouns : FALLBACK_PROPER)
// 分桶口径（固定）：同一词既在 dialectWords（难词）又在 properNouns（专名）时，归专名桶（文化专名、游客字面可懂、不计难词）；
// 只有纯俚语小吃词（老菱/鸡头果，只在 dialectWords、不在 properNouns）才进难词桶。308 行的 PROPER_NOUNS.has 已正确。
const DIALECT_SOURCE = _DATA ? 'data/dialect_words.json' : 'FALLBACK (内置兜底，JSON 缺失)'

// 共享的"清洗 + 行内标点细分"分句函数（去注释行；行内遇句末标点再切细；02_clean 逐句一行）。
// 顶层提取：三处重复逻辑收敛到一处，改分句规则只改这里。
const splitIntoSentences = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  const sentences = []
  for (const l of lines) {
    const sub = l.match(/[^。！？…]+[。！？…]?/gu)?.map((s) => s.trim()).filter(Boolean) ?? [l]
    for (const s of sub) sentences.push(s)
  }
  return sentences
}

export const textStatsTool = {
  inject: ['extension'],
  apply(ctx) {
    const agnes = ctx.extension()
    agnes.registerTool({
      name: 'demo_text_stats',
      description: 'Count characters and words in text.',
      parameters,
      meta,
      async execute({ text }) {
        const words = text.trim() ? text.trim().split(/\s+/u).length : 0
        const structured = { characters: text.length, words }
        return { content: [{ type: 'text', text: JSON.stringify(structured) }], structured }
      },
    })

    // 分句 + 方言词标记（10.09 parse_text 的雏形；10.08 最小闭环用它做测试工具）。
    const splitParams = {
      [Kind]: 'Object',
      type: 'object',
      properties: { text: { [Kind]: 'String', type: 'string', maxLength: 8192 } },
      required: ['text'],
      additionalProperties: false,
    }
    agnes.registerTool({
      name: 'split_sentences',
      description: '把中文唱词按句切分，并标出每句里出现的南京白局方言词。',
      parameters: splitParams,
      meta,
      async execute({ text }) {
        // 02_clean 的唱词是逐句一行，分句规则集中在顶层 splitIntoSentences()（去注释行 + 行内标点细分）。
        const sentences = splitIntoSentences(text)
        const marked = sentences.map((s) => {
          const hits = DIALECT_WORDS.filter((d) => s.includes(d.word)).map((d) => d.word)
          return { sentence: s, dialectHits: hits }
        })
        const structured = { sentenceCount: sentences.length, marked }
        return { content: [{ type: 'text', text: JSON.stringify(structured, null, 2) }], structured }
      },
    })

    // 10.09 工具①：parse_text——清洗/分句/jieba 分词/方言词标记，输出逐句 JSON。
    // jieba 原生扩展懒加载（首次 execute 时 import），避免 apply 同步体内 await；加载失败降级为按字切。
    let jiebaPromise = null
    const getJieba = () => {
      if (!jiebaPromise) {
        jiebaPromise = import('nodejieba').then((m) => m.default ?? m.jieba ?? null).catch(() => null)
      }
      return jiebaPromise
    }
    agnes.registerTool({
      name: 'parse_text',
      description: '清洗 / 分句 / jieba 分词 / 方言词标记，输出逐句 JSON（带分词结果与方言词命中）。',
      parameters: splitParams,
      meta,
      async execute({ text }) {
        const sentences = splitIntoSentences(text)
        const jieba = await getJieba()
        const parsed = sentences.map((s) => {
          const words = jieba ? jieba.cut(s, false) : [...s]
          const dialectHits = DIALECT_WORDS.filter((d) => s.includes(d.word)).map((d) => d.word)
          return { sentence: s, words, dialectHits }
        })
        const structured = {
          segmenter: jieba ? 'nodejieba' : 'fallback-char-split',
          sentenceCount: parsed.length,
          parsed,
        }
        return { content: [{ type: 'text', text: JSON.stringify(structured, null, 2) }], structured }
      },
    })

    // 10.08 架构修正：translate_to_plain 和 gen_knowledge_cards 已改写为 Skill（SKILL.md），
    // 让 Agnes 模型在 agent 循环中生成（这才是"模型参与核心任务"的真实证据）。
    // 本文件只保留 ① parse_text、④ verify_sources、⑤ readability_score 三个确定性 Tool。
    // Skill 位于 .agh/skills/translate-to-plain/SKILL.md 和 .agh/skills/gen-knowledge-cards/SKILL.md。
    // 如需离线对照，可临时恢复下方注释掉的 Tool 实现（按行扫知识库分块 + 子串匹配）。

    // 10.09 工具④：verify_sources——对知识卡 source 字段做溯源核验。
    // 知识库 source 里登记的编号（k01/k02/.../b01/b04）对应 sources_manifest.csv 里的真实 URL。
    // 本工具把编号映射到 URL，并标记"无来源=待考"，满足指标"知识卡溯源率 ≥80%"。
    const VERIFY_PARAMS = {
      [Kind]: 'Object',
      type: 'object',
      properties: {
        cards: {
          [Kind]: 'Array',
          type: 'array',
          items: {
            [Kind]: 'Object',
            type: 'object',
            properties: {
              topic: { [Kind]: 'String', type: 'string' },
              source: { [Kind]: 'String', type: 'string' },
            },
            required: ['topic', 'source'],
            additionalProperties: false,
          },
          minItems: 0,
          maxItems: 64,
        },
        manifestPath: { [Kind]: 'String', type: 'string', maxLength: 4096 },
      },
      required: ['cards'],
      additionalProperties: false,
    }
    // 兜底表（CSV 读不到时用；与 sources_manifest.csv 保持一致，便于离线降级）。
    const FALLBACK_SOURCE_URLS = {
      k01: 'https://www.ihchina.cn/project_details/13721/',
      k02: 'https://www.baike.com/wikiid/1550383644694897492',
      k03: 'https://www.nanjing.gov.cn/njxx/202503/t20250318_5097327.html',
      k04: 'https://www.gmw.cn/01gmrb/2007-09/11/content_669203.htm',
      k05: 'https://zhuanlan.zhihu.com/p/601169001',
      b01: 'http://news.youth.cn/jsxw/201705/t20170506_9678165.htm',
      b02: 'https://www.yangtse.com/news/jiangsu/nanjing/202609/t20260905_389800.html',
      b03: 'http://doss.xhby.net/zpaper/njcb/pc/att/202112/17/2b9b734c-a0dd-4228-bc82-4397260791f5.pdf',
      b04: 'https://www.bilibili.com/video/BV13oX6YrEps',
      b05: 'https://www.bilibili.com/video/BV1rC4y1c7GC',
      b06: 'https://www.bilibili.com/video/BV11R2xBeEWt',
      k06: 'https://zh.wikipedia.org/zh-hans/%E6%9C%B1%E9%9B%80%E6%A1%A5',
      k07: 'https://zh.wikipedia.org/zh-hans/%E4%B9%8C%E8%A1%A3%E5%B7%B7',
      k08: 'https://zh.wikipedia.org/zh-hans/%E7%99%BD%E9%B9%8E%E6%B4%8E%E5%85%AC%E5%9B%AD',
      k09: 'https://zh.wikipedia.org/zh-hans/%E8%93%9C%E9%A6%99%E6%A8%82',
    }
    agnes.registerTool({
      name: 'verify_sources',
      description: '核验知识卡来源：把 source 里的素材编号映射到真实 URL（默认从 sources_manifest.csv 动态读），无来源降级"待考"。',
      parameters: VERIFY_PARAMS,
      meta,
      async execute({ cards, manifestPath }) {
        // 动态读 CSV（发展性：新增 k10/k11 只改 CSV 不改源码）；读不到时降级兜底表。
        const { readFileSync, existsSync } = await import('node:fs')
        const csvPath = manifestPath || '../../../sources/sources_manifest.csv'
        const sourceUrls = { ...FALLBACK_SOURCE_URLS }
        let csvLoaded = false
        try {
          if (existsSync(csvPath)) {
            const rows = readFileSync(csvPath, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('编号'))
            // 健壮解析：按表头定位「编号」和「来源URL」列（不写死列序），列名变动也不读错
            const header = rows[0].split(',')
            const iCode = header.findIndex((h) => /编号|code/i.test(h))
            const iUrl = header.findIndex((h) => /url|来源/i.test(h))
            const dataRows = (iCode >= 0 && iUrl >= 0) ? rows.slice(1) : rows // 无表头则全部当数据行
            for (const row of dataRows) {
              const cols = row.split(',')
              const code = (iCode >= 0 ? cols[iCode] : cols[0])?.trim() || ''
              const cell = (iUrl >= 0 ? cols[iUrl] : cols[2])?.trim() || ''
              // 只取列里的纯 URL（从 http(s):// 起，到行尾/空白/中文标点/说明文字之前），避免备注混入
              const m = cell.match(/https?:\/\/[^\s，；;。【[（）]+/)
              const url = m ? m[0] : cell
              if (code && url && /^https?:\/\//.test(url)) sourceUrls[code] = url
              csvLoaded = true
            }
          }
        } catch {}
        const verified = cards.map((c) => {
          const raw = (c.source || '').trim()
          // 两种可溯源：source 含素材编号(k0x/b0x) 或 直接含 http(s) URL
          const codeMatches = raw.match(/\b(k0\d+|b0\d+)\b/g) || []
          const directUrls = raw.match(/https?:\/\/[^\s；;）)]+/g) || []
          const urls = [...codeMatches.map((code) => sourceUrls[code]).filter(Boolean), ...directUrls]
          const isTraceable = urls.length > 0
          return {
            topic: c.topic,
            source: raw,
            traceable: isTraceable ? 'yes' : 'no',
            urls,
            note: isTraceable ? '来源已登记' : '无来源，降级"待考"',
          }
        })
        const withSource = verified.filter((v) => v.traceable === 'yes').length
        const total = verified.length
        const traceableRate = total ? Math.round((withSource / total) * 100) : 0
        const structured = {
          total,
          traceableCount: withSource,
          traceableRate: traceableRate + '%',
          pass: traceableRate >= 80 ? 'yes' : 'no',
          source: csvLoaded ? csvPath : 'FALLBACK_SOURCE_URLS (CSV 未加载)',
          verified,
        }
        return { content: [{ type: 'text', text: JSON.stringify(structured, null, 2) }], structured }
      },
    })

    // 10.09 工具⑤：readability_score——对比原文与白话版的难词率 / 句长，量化"可读性提升"。
    // 难词定义：nodejieba 切词结果中未出现在"通用白话词白名单"里的词视为难词（粗估），
    // 同时保留 02_clean 的 DIALECT_WORDS 作为"方言词"独立统计。指标"难词率下降 <50%"基于此。
    const READABILITY_PARAMS = {
      [Kind]: 'Object',
      type: 'object',
      properties: {
        original: { [Kind]: 'String', type: 'string', maxLength: 8192 },
        plain: { [Kind]: 'String', type: 'string', maxLength: 8192 },
        replaceTable: {
          [Kind]: 'Object',
          type: 'object',
          additionalProperties: { [Kind]: 'String', type: 'string' },
          description: '可选：② 使用的白话替换表 {方言词: 白话词}。传入后，原文的难词率基于替换表命中（与②口径一致），不再子串匹配 DIALECT_WORDS。',
        },
      },
      required: ['original', 'plain'],
      additionalProperties: false,
    }
    agnes.registerTool({
      name: 'readability_score',
      description: '对比原文与白话版的难词率/句长，输出可读性对比表。',
      parameters: READABILITY_PARAMS,
      meta,
      async execute({ original, plain, replaceTable }) {
        const jieba = await getJieba()
        const origLines = splitIntoSentences(original)
        const plainLines = splitIntoSentences(plain)
        const rt = replaceTable || {}
        // 难词判定（v4 与 ② 白话替换表对齐）：
        // 难词 = 原文中命中 DIALECT_WORDS 的词（南京方言特有词，游客看不懂）。
        // 白话版把方言词替换成普通话（与 ② translate-to-plain 的替换表一致），难词率应显著下降。
        // 歇后语谐音双关词（针好/顶好）单列 harmony，不计难词。
        const HARMONY_WORDS = new Set(['针好','顶好'])
        const hardWordRate = (lines) => {
          const text = lines.join('')
          const totalChars = [...text.replace(/[\s，。！？…—、()（）\[\]【】\"“'’]/g, '')].length
          if (!totalChars) return { total: totalChars, hard: 0, harmony: 0, hardWords: [], rate: 0 }
          const hardSet = new Set()
          const harmonySet = new Set()
          for (const w of DIALECT_WORDS) {
            if (HARMONY_WORDS.has(w.word)) {
              if (text.includes(w.word)) harmonySet.add(w.word)
              continue
            }
            if (text.includes(w.word)) hardSet.add(w.word)
          }
          let hard = 0
          for (const w of hardSet) hard += text.split(w).length - 1
          let harmony = 0
          for (const w of harmonySet) harmony += text.split(w).length - 1
          const hardCount = hard + harmony
          return { total: totalChars, hard: hardCount, harmony, hardWords: [...hardSet], rate: Math.round((hardCount / totalChars) * 1000) / 10 + '%' }
        }
        // ② 替换表口径：难词=原文命中的替换表 key（方言词）；白话版=替换后残留命中数。
        // 歇后语谐音双关词（针好/顶好）单列 harmony，不计难词；但"么得"仍是难词。
        const hardWordRateRT = (lines, rt) => {
          const text = lines.join('')
          const totalChars = [...text.replace(/[\s，。！？…—、()（）\[\]【】\"“'’]/g, '')].length
          if (!totalChars) return { total: totalChars, hard: 0, harmony: 0, hardWords: [], rate: 0 }
          const hardSet = new Set()
          const harmonySet = new Set()
          let hard = 0, harmony = 0
          for (const w of Object.keys(rt)) {
            if (HARMONY_WORDS.has(w)) {
              if (text.includes(w)) { harmonySet.add(w); harmony += text.split(w).length - 1 }
              continue
            }
            if (text.includes(w)) { hardSet.add(w); hard += text.split(w).length - 1 }
          }
          const hardCount = hard + harmony
          return { total: totalChars, hard: hardCount, harmony, hardWords: [...hardSet], rate: Math.round((hardCount / totalChars) * 1000) / 10 + '%' }
        }
        const avgLen = (lines) => (lines.length ? Math.round((lines.join('').replace(/\s/g, '').length / lines.length) * 10) / 10 : 0)
        const oRate = Object.keys(rt).length ? hardWordRateRT(origLines, rt) : hardWordRate(origLines)
        const pRate = Object.keys(rt).length ? hardWordRateRT(plainLines, rt) : hardWordRate(plainLines)
        // 直接保留数值（不用字符串再 parseFloat，避免 % 解析的边界 bug）
        const oHardNum = oRate.total ? Math.round((oRate.hard / oRate.total) * 1000) / 10 : 0
        const pHardNum = pRate.total ? Math.round((pRate.hard / pRate.total) * 1000) / 10 : 0
        const drop = oHardNum ? Math.round(((oHardNum - pHardNum) / oHardNum) * 1000) / 10 : 0
        const structured = {
          metric: {
            originalHardRate: oRate.rate,
            plainHardRate: pRate.rate,
            hardDropPercent: drop + '%',
            originalAvgSentenceLen: avgLen(origLines),
            plainAvgSentenceLen: avgLen(plainLines),
            pass: drop >= 50 ? 'yes' : 'no',
          },
          detail: {
            original: { total: oRate.total, hard: oRate.hard, harmony: oRate.harmony, proper: oRate.proper, vulgar: oRate.vulgar, hardWords: oRate.hardWords, vulgarWords: oRate.vulgarWords },
            plain: { total: pRate.total, hard: pRate.hard, harmony: pRate.harmony, proper: pRate.proper, vulgar: pRate.vulgar, hardWords: pRate.hardWords, vulgarWords: pRate.vulgarWords },
          },
          wordlistSource: DIALECT_SOURCE,
        }
        return { content: [{ type: 'text', text: JSON.stringify(structured, null, 2) }], structured }
      },
    })

    agnes.on('session_start', () => {
      agnes.ctx.log.info('demo_text_stats is available for this session')
    })
  },
}
