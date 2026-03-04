import { ref } from 'vue'

export function useAiInterpret() {
  const aiLoading = ref(false)
  const aiContent = ref('')
  const aiError = ref('')
  const aiDone = ref(false)

  function collectChartInfo(chart) {
    if (!chart) return ''

    const lines = []

    lines.push(`【基本信息】`)
    lines.push(`${chart.isYangDun ? '阳遁' : '阴遁'}${chart.juNum}局`)
    lines.push(`节气：${chart.currentTerm}　${chart.yuan}元`)
    lines.push(`值符星：${chart.dutyStar}　值使门：${chart.dutyGate}`)
    lines.push(`旬首：${chart.xunShou}`)
    lines.push(`空亡：${chart.kongWang.join(' ')}`)

    lines.push('')
    lines.push(`【四柱】`)
    lines.push(`年柱：${chart.ganZhi.year.full}　月柱：${chart.ganZhi.month.full}`)
    lines.push(`日柱：${chart.ganZhi.day.full}　时柱：${chart.ganZhi.hour.full}`)

    lines.push('')
    lines.push(`【九宫盘局】`)
    for (let p = 1; p <= 9; p++) {
      const palace = chart.palaces[p]
      if (p === 5) {
        lines.push(`${palace.name}（${palace.element}）：天禽星　地盘${palace.earthStem}　天盘${palace.heavenStem}`)
      } else {
        const parts = [`${palace.name}（${palace.element}）`]
        parts.push(`星：${palace.star}`)
        parts.push(`门：${palace.gate}`)
        parts.push(`神：${palace.god}`)
        parts.push(`天盘${palace.heavenStem}`)
        parts.push(`地盘${palace.earthStem}`)
        lines.push(parts.join('　'))
      }
    }

    return lines.join('\n')
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

      const response = await fetch('/api/ai-qimen', {
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

    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

    html = html.replace(/\n\n+/g, '</p><p>')
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
    aiLoading, aiContent, aiError, aiDone,
    collectChartInfo, startAiInterpret, simpleMarkdown, reset,
  }
}
