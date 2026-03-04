// Rate limiting: max requests per IP per time window
const RATE_LIMIT_MAX = 3;        // max 3 requests
const RATE_LIMIT_WINDOW = 3600;  // per hour (seconds)
const MAX_QUESTION_LENGTH = 200;
const MAX_CHART_LENGTH = 5000;

async function checkRateLimit(ip, kv) {
  if (!kv) return true; // if KV not configured, skip

  const key = `ratelimit:qimen:${ip}`;
  const data = await kv.get(key, 'json');

  const now = Math.floor(Date.now() / 1000);

  if (!data) {
    await kv.put(key, JSON.stringify({ count: 1, start: now }), { expirationTtl: RATE_LIMIT_WINDOW });
    return true;
  }

  if (now - data.start > RATE_LIMIT_WINDOW) {
    await kv.put(key, JSON.stringify({ count: 1, start: now }), { expirationTtl: RATE_LIMIT_WINDOW });
    return true;
  }

  if (data.count >= RATE_LIMIT_MAX) {
    return false;
  }

  await kv.put(key, JSON.stringify({ count: data.count + 1, start: data.start }), {
    expirationTtl: RATE_LIMIT_WINDOW - (now - data.start),
  });
  return true;
}

function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || '0.0.0.0';
}

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Rate limiting
    const ip = getClientIP(context.request);
    const kv = context.env.RATE_LIMIT_KV;
    const allowed = await checkRateLimit(ip, kv);
    if (!allowed) {
      return new Response(JSON.stringify({ error: '请求太频繁，请稍后再试（每小时最多3次）' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await context.request.json();
    const { chartInfo, question } = body;

    // Input validation
    if (!chartInfo) {
      return new Response(JSON.stringify({ error: '请提供盘局信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (typeof chartInfo !== 'string') {
      return new Response(JSON.stringify({ error: '参数格式错误' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (chartInfo.length > MAX_CHART_LENGTH) {
      return new Response(JSON.stringify({ error: '盘局信息异常' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (question && typeof question === 'string' && question.length > MAX_QUESTION_LENGTH) {
      return new Response(JSON.stringify({ error: `提问不能超过${MAX_QUESTION_LENGTH}字` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI 服务未配置，请联系管理员' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const systemPrompt = `你是一位精通奇门遁甲的术数大师，擅长根据奇门盘局信息为用户进行专业的分析解读。

请根据以下奇门遁甲盘局信息，给出专业、详细的解读。解读应包含：

1. **盘局总览**：说明阴遁/阳遁几局，当前节气与三元，值符星与值使门
2. **整体格局判断**：是否存在伏吟、反吟、八门反伏等特殊格局
3. **用神分析**：根据用户所问事项，确定用神所在宫位，分析该宫的天地人神四层信息
4. **九宫逐宫分析**：
   - 天盘干与地盘干的组合含义（奇仪组合/格局，如青龙返首、飞鸟跌穴、悖格、刑格等）
   - 九星含义与旺衰
   - 八门含义与落宫状态
   - 八神含义
5. **空亡分析**：空亡落在哪些宫位，对盘局的影响
6. **综合判断**：结合天时（星）、地利（门）、人和（干）、神助（神），给出整体结论

注意事项：
- 用通俗易懂的语言解释，避免过于晦涩的术语
- 分析要有理有据，引用具体的宫位和元素
- 给出实际可行的建议
- 使用 Markdown 格式组织内容
- 不要编造盘局中没有的信息`;

    let userPrompt = `奇门遁甲盘局信息：\n${chartInfo}`;
    if (question && question.trim()) {
      userPrompt += `\n\n用户想占问的事项：${question.trim()}`;
    }
    userPrompt += '\n\n请根据以上盘局信息进行解读分析。';

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    const requestBody = JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 65536,
        thinkingConfig: { thinkingBudget: 2048 },
      },
    });

    // Start streaming response immediately to prevent Cloudflare 524 timeout.
    // Send heartbeat comments while waiting for Gemini API.
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Heartbeat: send SSE comment every 8s to keep connection alive
    const heartbeat = setInterval(async () => {
      try { await writer.write(encoder.encode(': heartbeat\n\n')); } catch {}
    }, 8000);

    (async () => {
      try {
        // Send initial heartbeat immediately
        await writer.write(encoder.encode(': connected\n\n'));

        let geminiResponse = null;
        for (const model of models) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
          geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
          });

          if (geminiResponse.ok) break;
          const s = geminiResponse.status;
          if (s === 429 || s === 403 || (s >= 500 && s < 600)) continue;
          break; // 4xx client errors won't recover, stop retrying
        }

        if (!geminiResponse.ok) {
          const status = geminiResponse.status;
          let errorMsg = 'AI 服务暂时不可用，请稍后重试';
          if (status === 429) errorMsg = '请求太频繁，请稍后再试';
          else if (status === 403) errorMsg = 'AI 服务今日额度已用完，请明天再试';
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`));
          return;
        }

        const reader = geminiResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {
              // skip malformed JSON
            }
          }
        }

        // Process remaining buffer
        if (buffer.startsWith('data: ')) {
          const jsonStr = buffer.slice(6).trim();
          if (jsonStr && jsonStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {}
          }
        }

        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: '传输中断' })}\n\n`));
      } finally {
        clearInterval(heartbeat);
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI 服务暂时不可用，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
