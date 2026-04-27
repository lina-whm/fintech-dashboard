import { NextRequest } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'inclusionai/ling-2.6-1t:free';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    if (!message) {
      return new Response(JSON.stringify({ error: 'No message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = context
      ? context
      : 'Ты — финансовый ассистент. Отвечай на русском языке, кратко и по делу.';

    // Пробуем OpenRouter, если есть ключ
    if (process.env.OPENROUTER_API_KEY) {
      try {
        return await handleOpenRouter(systemPrompt, message);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('OpenRouter failed, falling back to Ollama:', msg);
        // fallback to Ollama below
      }
    }

    // Fallback: локальный Ollama
    return handleOllama(systemPrompt);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleOpenRouter(systemPrompt: string, userMessage: string) {
  const encoder = new TextEncoder();

  const body = JSON.stringify({
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    stream: true,
  });

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://fintech-dashboard-six.vercel.app',
      'X-Title': 'FinTech Dashboard',
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`OpenRouter (${res.status}): ${errText}`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body?.getReader();
      if (!reader) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: 'Ошибка: пустой ответ' })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: content })}\n\n`));
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } catch (err) {
        console.error('OpenRouter stream error:', err);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

async function handleOllama(systemPrompt: string) {
  const encoder = new TextEncoder();

  const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3.5:0.8b',
      prompt: systemPrompt,
      stream: true,
    }),
  });

  if (!ollamaRes.ok) {
    const errText = await ollamaRes.text().catch(() => 'Unknown error');
    return new Response(
      JSON.stringify({ error: `AI недоступен (${ollamaRes.status}): ${errText}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body?.getReader();
      if (!reader) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: 'Ошибка: пустой ответ от AI' })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          for (const line of text.split('\n')) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ response: parsed.response })}\n\n`),
              );
              if (parsed.done) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        console.error('Ollama stream error:', err);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}