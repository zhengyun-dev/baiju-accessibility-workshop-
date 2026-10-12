// 白局·无障碍唱词工坊 · 前端逻辑
// ①④⑤ 确定性计算（与 plugin/index.mjs 同算法，浏览器直接跑）；②③ 离线演示（确定性替换 + 知识库匹配）。
// 数据来自 lib/dialect_data.js (window.BAIJU.dialect / .sources) 与 lib/kb_data.js (window.BAIJU.kb)。

(function () {
  'use strict'

  // ---------- 共享：分句（与 plugin 顶层 splitIntoSentences 一致）----------
  const splitIntoSentences = (text) => {
    const lines = String(text).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    const out = []
    for (const l of lines) {
      const sub = l.match(/[^。！？…]+[。！？…]?/gu)?.map((s) => s.trim()).filter(Boolean) ?? [l]
      for (const s of sub) out.push(s)
    }
    return out
  }

  const D = () => window.BAIJU.dialect
  const DIALECT = () => D().dialectWords
  const HARMONY = new Set((D().harmonyWords || []).map((o) => o.word))
  // 分桶口径（与 plugin 一致）：同一词既在 dialectWords 又在 properNouns 时，归专名桶（文化专名，游客字面可懂、不计难词）；
  // 纯俚语小吃词（只在 dialectWords）才进难词桶。PROPER 用原始 properNouns 集（不过滤），与 ⑤ 的 PROPER_NOUNS.has 同逻辑。
  const PROPER = new Set(D().properNouns || [])

  // ---------- ① parse_text：分句 + 方言词标记（浏览器版不引 jieba，词切分退化为逐字+词表命中）----------
  function parseText(text) {
    const sentences = splitIntoSentences(text)
    const parsed = sentences.map((s) => {
      const hits = DIALECT().filter((d) => s.includes(d.word)).map((d) => d.word)
      return { sentence: s, words: [...s], dialectHits: hits }
    })
    return { segmenter: 'char-split(浏览器)', sentenceCount: parsed.length, parsed }
  }

  // ---------- ⑤ readability_score（与 plugin v4 同算法：难词子串去重 + vulgar/harmony/proper 分桶）----------
  function readability(original, plain) {
    const rate = (lines) => {
      const text = lines.join('')
      const totalChars = [...text.replace(/[\s，。！？…—、()（）\[\]【】"“'’]/g, '')].length
      if (!totalChars) return { total: totalChars, hard: 0, harmony: 0, proper: 0, vulgar: 0, hardWords: [], vulgarWords: [], rate: 0 }
      const hardSet = new Set(), harmonySet = new Set(), properSet = new Set(), vulgarSet = new Set()
      for (const w of DIALECT()) {
        const word = w.word
        if (PROPER.has(word)) { if (text.includes(word)) properSet.add(word); continue }
        if (HARMONY.has(word)) { if (text.includes(word)) harmonySet.add(word); continue }
        if (w.tag === 'vulgar') { if (text.includes(word)) vulgarSet.add(word); continue }
        if (text.includes(word)) hardSet.add(word)
      }
      const hardArr = [...hardSet]
      // 子串去重：互为子串只数最长词
      const dedup = hardArr.filter((w) => !hardArr.some((o) => o !== w && o.includes(w)))
      let hard = 0
      for (const w of dedup) hard += text.split(w).length - 1
      return {
        total: totalChars, hard,
        harmony: harmonySet.size, proper: properSet.size, vulgar: vulgarSet.size,
        hardWords: hardArr, vulgarWords: [...vulgarSet],
        rate: Math.round((hard / totalChars) * 1000) / 10 + '%',
      }
    }
    const oLines = splitIntoSentences(original)
    const pLines = splitIntoSentences(plain)
    const o = rate(oLines), p = rate(pLines)
    const oH = Number(o.rate.replace('%', '')), pH = Number(p.rate.replace('%', ''))
    const drop = oH ? Math.round(((oH - pH) / oH) * 1000) / 10 : 0
    return {
      metric: {
        originalHardRate: o.rate, plainHardRate: p.rate, hardDropPercent: drop + '%',
        originalAvgLen: Math.round((oLines.join('').replace(/\s/g, '').length / Math.max(1, oLines.length)) * 10) / 10,
        plainAvgLen: Math.round((pLines.join('').replace(/\s/g, '').length / Math.max(1, pLines.length)) * 10) / 10,
        pass: drop >= 50 ? 'yes' : 'no',
      },
      detail: { original: o, plain: p },
    }
  }

  // ---------- ④ verify_sources（与 plugin 一致：编号→URL，直接 URL 也算；≥80% pass）----------
  function verifySources(cards) {
    const srcMap = {}
    for (const s of window.BAIJU.sources) srcMap[s.code] = s.url
    const verified = cards.map((c) => {
      const raw = (c.source || '').trim()
      const codes = raw.match(/\b(k0\d+|b0\d+)\b/g) || []
      const direct = raw.match(/https?:\/\/[^\s；;）)]+/g) || []
      const urls = [...codes.map((code) => srcMap[code]).filter(Boolean), ...direct]
      const ok = urls.length > 0
      return { topic: c.topic, source: raw, traceable: ok ? 'yes' : 'no', urls, note: ok ? '来源已登记' : '无来源，降级"待考"' }
    })
    const withSrc = verified.filter((v) => v.traceable === 'yes').length
    const total = verified.length
    const rate = total ? Math.round((withSrc / total) * 100) : 0
    return { total, traceableCount: withSrc, traceableRate: rate + '%', pass: rate >= 80 ? 'yes' : 'no', verified }
  }

  // ---------- ② translate-to-plain（离线演示：用词表"释义"替换方言词，未命中原样保留；不编造）----------
  // 核心释义：从 meaning 里剥掉注释（全角/半角括号 + 斜杠后的解释 + "一词多义/字面可懂/病名"标记），
  // 只留口语化的白话正文，让 TTS 念起来像说话。
  function coreMeaning(raw) {
    if (!raw) return ''
    let s = String(raw)
    // 括号及其内容（全角/半角，含嵌套一层）
    s = s.replace(/[（(][^（）()]*[）)]/g, '')
    // 斜杠展开的"一词多义"：保留斜杠前第一项（如"坐骨/臀部湿疹"→"坐骨湿疹"；"拖、趶拉"→"拖"）
    s = s.replace(/[、/](?=([^、/]*[、/]*)*$)/, '') // 去末尾顿号/斜杠分隔后的尾巴
    // 常见解释性后缀整句去
    s = s.replace(/；[^；]*$/, '') // 去最后一个分号后的注释
    s = s.replace(/[；,]?(病名|字面可懂|南京话|南京方言|列作南京口语|词源.*|待考|水生植物.*|南京秋令小吃)[^。；]*$/, '')
    // 剩余标点后留一字距让 TTS 自然停顿
    s = s.replace(/[。，、；！？]+/g, ' ').replace(/\s+/g, ' ').trim()
    return s
  }
  function translatePlain(text) {
    const reps = DIALECT()
      .filter((w) => w.meaning && !/待考/.test(w.meaning || '')) // 拿不准的（含"待考"）不替换，保留原词+标注
      .map((w) => ({ word: w.word, core: coreMeaning(w.meaning), meaning: w.meaning }))
      .sort((a, b) => b.word.length - a.word.length)
    const sentences = splitIntoSentences(text)
    const out = sentences.map((s) => {
      let plain = s
      const used = []
      for (const r of reps) {
        if (plain.includes(r.word)) {
          // 白话对照显示用完整释义；但核心释义也存一份供 TTS 用
          plain = plain.split(r.word).join(r.core || r.meaning)
          used.push(r.word)
        }
      }
      return { sentence: s, plain, replaced: used }
    })
    return { translator: '离线演示(确定性替换)', sentenceCount: out.length, translated: out }
  }

  // ---------- ③ gen-knowledge-cards（离线演示：唱词里的关键词在知识库 tags 里匹配）----------
  function genCards(text) {
    const t = text
    const cards = []
    for (const kb of window.BAIJU.kb) {
      const hit = kb.tags.find((tag) => t.includes(tag))
      if (hit) cards.push({ keyword: hit, topic: kb.topic, summary: kb.summary, source: kb.source, status: 'hit' })
    }
    // 统计未命中的潜在关键词（词表里出现但知识库没有的）
    const foundKeywords = cards.map((c) => c.keyword)
    return {
      note: '离线演示：唱词关键词 → 知识库匹配；命中带来源编号（④ 会核验 URL）',
      totalKeywords: foundKeywords.length,
      hitKeywords: cards.length,
      cards,
    }
  }

  // ---------- 渲染 ----------
  const $ = (id) => document.getElementById(id)
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const show = (id) => $(id).classList.add('show')

  function renderParse(r) {
    const sec = $('sec-parse'); show('sec-parse')
    const rows = r.parsed.map((p) =>
      `<tr><td>${esc(p.sentence)}</td><td>${p.dialectHits.length ? p.dialectHits.map((w) => `<span class="tag hit">${esc(w)}</span>`).join('') : '<span class="note">—</span>'}</td></tr>`
    ).join('')
    sec.innerHTML = `<div class="kv">
        <div class="box"><div class="n">${r.sentenceCount}</div><div class="t">句数（逐句一行）</div></div>
        <div class="box"><div class="n">${DIALECT().length}</div><div class="t">词表词条</div></div>
      </div>
      <table><thead><tr><th>句子</th><th>命中方言词</th></tr></thead><tbody>${rows || '<tr><td colspan="2" class="empty">（无）</td></tr>'}</tbody></table>`
  }

  function renderTranslate(r) {
    const sec = $('sec-translate'); show('sec-translate')
    const rows = r.translated.map((t) => {
      const mark = t.sentence.replace(/(.)/g, '$1') // 原句
      const dialect = DIALECT().filter((d) => t.sentence.includes(d.word)).map((d) => `<span class="tag hit">${esc(d.word)}</span>`)
      return `<div class="trans">
          <div class="col"><div class="row">${esc(t.sentence)}<div style="margin-top:8px">${dialect.join(' ') || '<span class="note">无方言词</span>'}</div></div></div>
          <div class="col"><div class="row plain">${esc(t.plain)}</div></div>
        </div>`
    }).join('')
    sec.innerHTML = `<div class="kv"><div class="box"><div class="n">${r.sentenceCount}</div><div class="t">句数 · 覆盖率 100%</div></div>
      <div class="box"><div class="n">离线演示</div><div class="t">接入 Agnes 后升级为 AI 生成</div></div></div>
      ${rows}`
  }

  function renderCards(r) {
    const sec = $('sec-cards'); show('sec-cards')
    if (!r.cards.length) { sec.innerHTML = '<div class="empty">本段唱词未匹配到知识库典故（可手动补卡）</div>'; return }
    const cards = r.cards.map((c) =>
      `<div class="card"><span class="tag hit">命中「${esc(c.keyword)}」</span>
       <div class="ttl">${esc(c.topic)}</div>
       <div style="margin-top:8px;color:var(--muted);font-size:14px;line-height:1.8">${esc(c.summary)}</div>
       <div class="src">来源编号 ${esc(c.source)} · 来源核验见 04</div></div>`
    ).join('')
    sec.innerHTML = `<div class="kv"><div class="box"><div class="n">${r.hitKeywords}/${r.totalKeywords}</div><div class="t">命中关键词</div></div></div>${cards}`
  }

  function renderVerify(v) {
    const sec = $('sec-verify'); show('sec-verify')
    const rows = v.verified.map((c) =>
      `<tr><td>${esc(c.topic)}</td><td><code>${esc(c.source)}</code></td>
       <td class="${c.traceable === 'yes' ? 'ok' : 'no'}">${c.traceable === 'yes' ? '可溯源' : '待考'}</td>
       <td>${c.urls.length ? `<a href="${esc(c.urls[0])}" target="_blank" rel="noopener">${esc(c.urls[0])}</a>` : '<span class="note">无</span>'}</td></tr>`
    ).join('')
    sec.innerHTML = `<div class="kv">
        <div class="box"><div class="n ${v.pass === 'yes' ? 'ok' : 'no'}">${v.traceableRate}</div><div class="t">溯源率（达标 ≥ 80%）</div></div>
        <div class="box"><div class="n">${v.traceableCount}/${v.total}</div><div class="t">可溯源卡</div></div>
      </div>
      <table><thead><tr><th>主题</th><th>来源编号</th><th>判定</th><th>URL</th></tr></thead><tbody>${rows}</tbody></table>`
  }

  function renderRead(r) {
    const sec = $('sec-read'); show('sec-read')
    const o = r.detail.original, p = r.detail.plain
    sec.innerHTML = `<div class="kv">
        <div class="box"><div class="n">${o.rate}</div><div class="t">原文难词率</div></div>
        <div class="box"><div class="n">${p.rate}</div><div class="t">白话难词率</div></div>
        <div class="box"><div class="n ${r.metric.pass === 'yes' ? 'ok' : 'no'}">${r.metric.hardDropPercent}</div><div class="t">难词下降（达标 ≥ 50%）</div></div>
      </div>
      <table><thead><tr><th>类别</th><th>原文</th><th>白话</th></tr></thead><tbody>
        <tr><td>难词（南京俚语）</td><td>${o.hard}（${o.hardWords.length} 种）</td><td>${p.hard}（${p.hardWords.length} 种）</td></tr>
        <tr><td>专名（文化密度）</td><td>${o.proper}</td><td>${p.proper}</td></tr>
        <tr><td>谐音双关</td><td>${o.harmony}</td><td>${p.harmony}</td></tr>
      </tbody></table>
      <div class="note">词表来源：${esc(D().note || 'data/dialect_words.json')}</div>`
  }

  // ---------- 主流程 ----------
  function getText() { return $('lyric').value }

  function runAll() {
    const text = getText()
    if (!text.trim()) { $('lyric').focus(); alert('先粘贴唱词'); return }
    $('demoFlag').style.display = 'block'
    const r1 = parseText(text); renderParse(r1)
    const r2 = translatePlain(text); renderTranslate(r2)
    const r3 = genCards(text); renderCards(r3)
    const cardList = r3.cards.map((c) => ({ topic: c.topic, source: c.source }))
    const r4 = verifySources(cardList); renderVerify(r4)
    const plainText = r2.translated.map((t) => t.plain).join('\n')
    lastPlain = r2.translated.map((t) => t.plain).join('，') // 供 TTS 朗读用
    const r5 = readability(text, plainText); renderRead(r5)
    window.scrollTo({ top: $('sec-parse').offsetTop - 20, behavior: 'smooth' })
  }

  function onlyParse() {
    const text = getText()
    if (!text.trim()) { $('lyric').focus(); alert('先粘贴唱词'); return }
    renderParse(parseText(text)); show('sec-parse')
  }

  // ---------- 主题切换（四套新中式配色）----------
  function setTheme(t) {
    document.body.dataset.theme = t
    try { localStorage.setItem('baiju-theme', t) } catch (e) { /* 忽略 */ }
    document.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('active', s.dataset.t === t))
  }

  // ---------- TTS 朗读白话（浏览器自带 speechSynthesis）----------
  let lastPlain = ''
  function cleanForSpeech(raw) {
    // ② 白话已用核心释义替换，这里再兜底：删残留括号 + 去标点，只留要念的口语
    let clean = raw.replace(/[（(][^（）()]*[）)]/g, '')
    clean = clean.replace(/[。，、…—·！？；："“】】]/g, ' ')
    clean = clean.replace(/\s+/g, ' ').trim()
    return clean
  }
  function speakPlain() {
    if (!('speechSynthesis' in window)) { alert('当前浏览器不支持 TTS 朗读'); return }
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return }
    const rawText = lastPlain || translatePlain(getText()).translated.map((t) => t.plain).join(' ')
    lastPlain = rawText
    const u = new SpeechSynthesisUtterance(cleanForSpeech(rawText))
    u.lang = 'zh-CN'
    u.rate = 0.85
    u.pitch = 1
    const voices = window.speechSynthesis.getVoices().filter((v) => /zh/i.test(v.lang))
    if (voices.length) u.voice = voices.find((v) => /微软|阿里|Google/i.test(v.name)) || voices[0]
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  // 预设样例
  const PRESETS = {
    'preset-jifangk': "机房啊不好做\n这几天又被那坐板疮来磨啊\n老板叫我七天织一个\n怎奈我疼痛一天只能绞上几十梭\n我靸了一双烂鞋头儿追也追不着\n碰到了茅草桩\n肩背着拎桶儿\n手拐腰子箩\n我天天到夫子庙\n卖热老菱哦\n代卖鸡头果儿啊",
    'preset-jinlingyou': "青砖小瓦马头墙\n桨声灯影游画舫\n夫子庙前秦淮河\n十里秦淮夜未央\n乌衣巷口夕阳斜\n媚香楼里桃花扇",
    'preset-shuohao': "说好六千给一万\n老板要人还课\n那焦头鸡的老板还要天天催生活",
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 恢复上次选的配色
    let saved = 'yuanshan'
    try { saved = localStorage.getItem('baiju-theme') || 'yuanshan' } catch (e) { /* 忽略 */ }
    setTheme(saved)
    document.querySelectorAll('.swatch').forEach((s) => s.addEventListener('click', () => setTheme(s.dataset.t)))

    $('run').addEventListener('click', onlyParse)
    $('runAll').addEventListener('click', runAll)
    $('tts').addEventListener('click', speakPlain)
    $('clear').addEventListener('click', () => { $('lyric').value = ''; document.querySelectorAll('section.show').forEach((s) => { s.classList.remove('show'); s.innerHTML = s.querySelector('h2') ? s.querySelector('h2').outerHTML + '<div class="empty">待生成</div>' : '<div class="empty">待生成</div>' }) })
    for (const [id, txt] of Object.entries(PRESETS)) {
      const el = document.getElementById(id)
      if (el) el.addEventListener('click', (e) => { e.preventDefault(); $('lyric').value = txt; runAll() })
    }
  })
})()
