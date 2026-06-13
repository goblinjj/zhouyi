// Rate limiting: max requests per IP per time window
const RATE_LIMIT_MAX = 3;        // max 3 requests
const RATE_LIMIT_WINDOW = 3600;  // per hour (seconds)
const MAX_QUESTION_LENGTH = 200;
const MAX_HEXAGRAM_LENGTH = 2000;

async function checkRateLimit(ip, kv) {
  if (!kv) return true; // if KV not configured, skip

  const key = `ratelimit:${ip}`;
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
    const { question, hexagramInfo } = body;

    // Input validation
    if (!question || !hexagramInfo) {
      return new Response(JSON.stringify({ error: '请提供占卜事件和卦象信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (typeof question !== 'string' || typeof hexagramInfo !== 'string') {
      return new Response(JSON.stringify({ error: '参数格式错误' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return new Response(JSON.stringify({ error: `占卜事件描述不能超过${MAX_QUESTION_LENGTH}字` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (hexagramInfo.length > MAX_HEXAGRAM_LENGTH) {
      return new Response(JSON.stringify({ error: '卦象信息异常' }), {
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

    const systemPrompt = `你是一位精通六爻占卜的易学大师，擅长根据卦象信息为用户解读占卜结果。

请根据以下卦象信息和用户的占卜事件，给出专业、详细的解读。

**解卦顺序（务必按此顺序展开分析）**：
1. **世应分析**：先从应爻、世爻入手，解析卦主（求占之人）与所占之事之间的关系与态势（世为己、应为他/事，看其旺衰、生克、动静、比和冲合）
2. **用神剖判**：再根据所占之事取用神（如问财取财爻、问官取官爻、问婚取应爻或官鬼/妻财等），结合日月生克、动变化出，解释求占之事当前的状态与吉凶
3. **卦象背景与事态演进**：最后回归卦象本身（卦名、卦辞、上下卦象意），并按"本卦→互卦→变卦"的三段时序，串讲整件事的来龙去脉：
   - **本卦 = 现状/起局**：求占之事当前所处的态势与格局；
   - **互卦 = 过程/中段**：事情如何从现状走向结局——其间的发展路径、所经历的曲折阻力、需要借助或防范的因素、不易察觉的隐情（互卦由本卦内四爻互联而成，下卦取二三四爻、上卦取三四五爻，专主"过程"）；
   - **变卦 = 结局/终局**：事情最终的走向与结果（变卦由动爻变出，专主"结果"）。
   务必讲清三者的因果衔接：现状如何、要经历怎样的过程、最终落到什么结局。

在以上主线之上，补充如下要点：
- **六兽参考**：结合六兽的象征意义辅助判断（青龙喜庆、朱雀口舌、勾陈牵连、螣蛇惊忧、白虎凶险、玄武暗昧）
- **动爻与变爻**：如有动爻，分析动爻的影响、变出之爻的回头生克，并据此判定"结局"（变卦）的吉凶
- **互卦运用**：若卦象信息中给出了互卦，重点回答"如何达到这个结局"——指出过程中的关键节点、助力与障碍，给出可操作的应对建议；若无互卦（无动爻），则事态相对静定、无明显过程演变，可不展开此项
- **旬空与日破**：如涉及旬空、月破、日破、暗动，明确指出其影响
- **综合判断**：结合占卜事件，给出明确的吉凶判断和实际可行的建议

注意事项：
- 用通俗易懂的语言解释，避免过于晦涩
- 判断要有理有据，引用具体的爻位和生克关系
- 使用 Markdown 格式组织内容`;

    const userPrompt = `占卜事件：${question}

卦象信息：
${hexagramInfo}

请根据以上信息进行解卦。`;

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

    const heartbeat = setInterval(async () => {
      try { await writer.write(encoder.encode(': heartbeat\n\n')); } catch {}
    }, 8000);

    (async () => {
      try {
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
