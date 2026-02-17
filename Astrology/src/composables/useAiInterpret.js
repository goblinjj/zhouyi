import { ref } from 'vue'
import { MUTAGEN_LABELS, TIME_OPTIONS } from './usePaipanConstants'

export function useAiInterpret() {
  const aiLoading = ref(false)
  const aiContent = ref('')
  const aiError = ref('')
  const aiDone = ref(false)

  function collectChartInfo(astrolabe, horoscopeData, selDecadal, selYear, gender) {
    if (!astrolabe) return ''

    const lines = []

    // Basic info
    lines.push(`【基本信息】`)
    lines.push(`阳历：${astrolabe.solarDate}`)
    lines.push(`阴历：${astrolabe.lunarDate}`)
    lines.push(`性别：${gender}`)
    lines.push(`五行局：${astrolabe.fiveElementsClass}`)
    lines.push(`命主：${astrolabe.soul}　身主：${astrolabe.body}`)
    lines.push(`星座：${astrolabe.sign}　生肖：${astrolabe.zodiac}`)

    // Four pillars
    const cd = astrolabe.rawDates?.chineseDate
    if (cd) {
      lines.push('')
      lines.push(`【四柱】`)
      if (cd.yearly) lines.push(`年柱：${cd.yearly[0]}${cd.yearly[1]}`)
      if (cd.monthly) lines.push(`月柱：${cd.monthly[0]}${cd.monthly[1]}`)
      if (cd.daily) lines.push(`日柱：${cd.daily[0]}${cd.daily[1]}`)
      if (cd.hourly) lines.push(`时柱：${cd.hourly[0]}${cd.hourly[1]}`)
    }

    // Birth mutagens (生年四化)
    const birthStem = cd?.yearly?.[0]
    if (birthStem) {
      lines.push('')
      lines.push(`【生年四化】`)
      // We can derive from SIHUA_TABLE but it's in constants
      // Instead, scan palaces for mutagens
      const mutagenInfo = []
      for (const p of astrolabe.palaces) {
        for (const star of [...(p.majorStars || []), ...(p.minorStars || [])]) {
          if (star.mutagen) {
            mutagenInfo.push(`${star.name} 化${star.mutagen} (在${p.name})`)
          }
        }
      }
      if (mutagenInfo.length > 0) {
        lines.push(mutagenInfo.join('、'))
      }
    }

    // Twelve palaces
    lines.push('')
    lines.push(`【十二宫】`)
    for (const p of astrolabe.palaces) {
      const palaceLine = []
      palaceLine.push(`${p.name}（${p.heavenlyStem}${p.earthlyBranch}）`)

      // Major stars
      const majors = (p.majorStars || [])
        .filter(s => s.name && s.name !== '')
        .map(s => {
          let text = s.name
          if (s.brightness) text += `(${s.brightness})`
          if (s.mutagen) text += `[化${s.mutagen}]`
          return text
        })
      if (majors.length > 0) palaceLine.push(`主星：${majors.join(' ')}`)

      // Minor stars
      const minors = (p.minorStars || [])
        .filter(s => s.name && s.name !== '')
        .map(s => {
          let text = s.name
          if (s.brightness) text += `(${s.brightness})`
          if (s.mutagen) text += `[化${s.mutagen}]`
          return text
        })
      if (minors.length > 0) palaceLine.push(`辅星：${minors.join(' ')}`)

      // Adjective stars (杂曜)
      const adjs = (p.adjectiveStars || [])
        .filter(s => s.name && s.name !== '')
        .map(s => s.name)
      if (adjs.length > 0) palaceLine.push(`杂曜：${adjs.join(' ')}`)

      lines.push(palaceLine.join('　'))
    }

    // Body palace location
    const bodyPalace = astrolabe.palaces.find(p => p.isBodyPalace)
    if (bodyPalace) {
      lines.push('')
      lines.push(`【身宫】位于${bodyPalace.name}`)
    }

    // If user hasn't selected decadal/year, auto-calculate for current year
    let useHoroscope = horoscopeData
    let useDecadal = selDecadal
    let useYear = selYear
    let autoCalculated = false

    if (!selDecadal && !selYear) {
      try {
        const now = new Date()
        const currentYear = now.getFullYear()
        const dateStr = `${currentYear}-${now.getMonth() + 1}-${now.getDate()}`
        const autoData = astrolabe.horoscope(dateStr, 0)
        if (autoData) {
          useHoroscope = {
            decadal: autoData.decadal,
            yearly: autoData.yearly,
            age: autoData.age,
          }
          // Find matching decadal from palaces
          if (autoData.decadal) {
            const dp = astrolabe.palaces.find(p =>
              p.decadal && p.decadal.range[0] <= (autoData.age?.nominalAge || 0) &&
              p.decadal.range[1] >= (autoData.age?.nominalAge || 0)
            )
            if (dp) {
              useDecadal = {
                stem: dp.decadal.heavenlyStem,
                branch: dp.decadal.earthlyBranch,
                range: dp.decadal.range,
                name: dp.name,
              }
            }
          }
          useYear = currentYear
          autoCalculated = true
        }
      } catch (e) {
        // fallback: no decadal/year info
      }
    }

    // Decadal info
    if (useDecadal && useHoroscope?.decadal) {
      lines.push('')
      lines.push(`【大限信息】${autoCalculated ? '（自动按当前年份计算）' : ''}`)
      lines.push(`大限：${useDecadal.stem}${useDecadal.branch}（${useDecadal.range[0]}-${useDecadal.range[1]}岁）`)
      lines.push(`大限宫位：${useDecadal.name}`)
      if (useHoroscope.decadal.mutagen) {
        const mutagenStrs = useHoroscope.decadal.mutagen.map((star, i) =>
          `${star} 化${MUTAGEN_LABELS[i]}`
        )
        lines.push(`大限四化：${mutagenStrs.join('、')}`)
      }
    }

    // Year info (only when user selected year, or auto-calculated; skip if user only selected decadal)
    if (useYear && useHoroscope?.yearly && (autoCalculated || selYear)) {
      lines.push('')
      lines.push(`【流年信息】${autoCalculated ? '（自动按当前年份计算）' : ''}`)
      lines.push(`流年：${useHoroscope.yearly.heavenlyStem}${useHoroscope.yearly.earthlyBranch}年`)
      if (useHoroscope.age?.nominalAge) {
        lines.push(`虚岁：${useHoroscope.age.nominalAge}`)
      }
      if (useHoroscope.yearly.mutagen) {
        const mutagenStrs = useHoroscope.yearly.mutagen.map((star, i) =>
          `${star} 化${MUTAGEN_LABELS[i]}`
        )
        lines.push(`流年四化：${mutagenStrs.join('、')}`)
      }
    }

    // Build scope description for UI display
    const scopeParts = []
    if (useDecadal) {
      const label = autoCalculated ? '自动' : '已选'
      scopeParts.push(`大限：${useDecadal.stem}${useDecadal.branch}（${useDecadal.range[0]}-${useDecadal.range[1]}岁）[${label}]`)
    }
    if (useYear && (autoCalculated || selYear)) {
      const label = autoCalculated ? '自动' : '已选'
      const yearLabel = useHoroscope?.yearly
        ? `${useHoroscope.yearly.heavenlyStem}${useHoroscope.yearly.earthlyBranch}年`
        : `${useYear}年`
      scopeParts.push(`流年：${yearLabel} [${label}]`)
    }
    if (scopeParts.length === 0) {
      scopeParts.push('仅分析本命盘')
    }

    return {
      chartInfo: lines.join('\n'),
      scopeDesc: scopeParts.join('，'),
      autoCalculated,
    }
  }

  async function startAiInterpret(chartInfo, question) {
    aiLoading.value = true
    aiContent.value = ''
    aiError.value = ''
    aiDone.value = false

    let fullText = ''

    try {
      const body = { chartInfo }
      if (question && question.trim()) {
        body.question = question.trim()
      }

      const response = await fetch('/api/ai-ziwei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        let errorMsg = '网络连接失败，请检查网络后重试'
        try {
          const errData = await response.json()
          if (errData.error) errorMsg = errData.error
        } catch {}
        aiError.value = errorMsg
        aiLoading.value = false
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              fullText += '\n\n（传输中断，内容可能不完整）'
              aiContent.value = fullText
              aiError.value = parsed.error
              aiLoading.value = false
              return
            }
            if (parsed.text) {
              fullText += parsed.text
              aiContent.value = fullText
            }
          } catch {}
        }
      }

      aiContent.value = fullText
      aiDone.value = true
    } catch (err) {
      if (fullText) {
        fullText += '\n\n（传输中断，内容可能不完整）'
        aiContent.value = fullText
      }
      aiError.value = '网络连接失败，请检查网络后重试'
    } finally {
      aiLoading.value = false
    }
  }

  function simpleMarkdown(text) {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Bold & italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Unordered list items
    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>')

    // Ordered list items
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

    // Paragraphs: double newline
    html = html.replace(/\n\n+/g, '</p><p>')
    // Single newline to <br>
    html = html.replace(/\n/g, '<br>')

    html = '<p>' + html + '</p>'
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>(<h[1-4]>)/g, '$1')
    html = html.replace(/(<\/h[1-4]>)<\/p>/g, '$1')
    html = html.replace(/<p>(<ul>)/g, '$1')
    html = html.replace(/(<\/ul>)<\/p>/g, '$1')

    return html
  }

  function reset() {
    aiLoading.value = false
    aiContent.value = ''
    aiError.value = ''
    aiDone.value = false
  }

  return {
    aiLoading,
    aiContent,
    aiError,
    aiDone,
    collectChartInfo,
    startAiInterpret,
    simpleMarkdown,
    reset,
  }
}
