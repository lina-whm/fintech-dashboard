import { NextRequest } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

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
      ? `${context}\n\nВопрос пользователя: ${message}`
      : `Ты — финансовый ассистент. Отвечай на русском языке, кратко и по делу. Вопрос: ${message}`;

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
        JSON.stringify({ error: `Ollama error (${ollamaRes.status}): ${errText}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Проксируем стрим от Ollama клиенту
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: "Ошибка: пустой ответ от Ollama" })}\n\n`));
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
            const lines = text.split('\n');

            for (const line of lines) {
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
                // Пропускаем битые строки
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
