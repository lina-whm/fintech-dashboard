import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 });

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.5:0.8b',
        prompt: message,
        stream: false,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ reply: data.response });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}