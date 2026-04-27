import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_MODEL = process.env.OPENROUTER_VISION_MODEL || 'qwen-vl-plus:free';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Ограничение размера: 10MB
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Изображение слишком большое (макс. 10MB)' }, { status: 400 });
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
      - category: определи категорию расхода из списка: Еда, Транспорт, Покупки, Здоровье, Развлечения, Зарплата, Другое

      Верни ответ строго в формате JSON без пояснений:
      {
        "title": "название",
        "amount": 1234.56,
        "date": "2026-04-23",
        "category": "Еда"
      }
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://fintech-dashboard-six.vercel.app',
        'X-Title': 'FinTech Dashboard',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        stream: false,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`OpenRouter error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenRouter');
    }

    let parsed: {
      title: string;
      amount: number;
      date: string;
      category: string;
    };

    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
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