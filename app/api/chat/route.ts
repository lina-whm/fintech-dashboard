import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || '';

    console.log('📤 Запрос к Ollama:', lastMessage);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.5:0.8b',
        prompt: lastMessage,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка Ollama:', response.status, errorText);
      return NextResponse.json({ error: `Ollama вернул ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ Ответ Ollama:', data.response);
    
    return NextResponse.json({ message: data.response });
  } catch (error: any) {
    console.error('🔥 Ошибка API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}