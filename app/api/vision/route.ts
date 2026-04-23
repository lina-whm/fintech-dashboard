import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const prompt = `
      Ты — финансовый ассистент. Проанализируй изображение чека и извлеки из него следующую информацию:
      - title: название магазина или услуги (строка)
      - amount: итоговая сумма к оплате (число, только цифры, без валюты)
      - date: дата операции в формате YYYY-MM-DD (если не указана, используй сегодняшнюю дату)
      - category: определи категорию расхода из списка: Food, Transport, Shopping, Health, Entertainment, Salary, Other
      - type: всегда "expense" для чеков

      Верни ответ строго в формате JSON без пояснений:
      {
        "title": "название",
        "amount": 1234.56,
        "date": "2026-04-23",
        "category": "Food"
      }
    `;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3-vl:2b',
        prompt: prompt,
        images: [dataUrl],
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = (await response.json()) as { response: string };
    let parsed: {
      title: string;
      amount: number;
      date: string;
      category: string;
    };

    try {
      parsed = JSON.parse(data.response);
    } catch {
      // Вместо флага /s используем [\s\S] для совместимости с ES2017
      const match = data.response.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Invalid response format');
      }
    }

    if (!parsed.title || !parsed.amount) {
      throw new Error('Missing required fields');
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('Vision API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}