import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transactions = body.transactions as Array<{
      id: string;
      title: string;
      amount: number;
      category: string;
      type: 'income' | 'expense';
      date: string;
    }> | undefined;
    const summary = body.summary as { income: number; expenses: number } | undefined;

    const totalExpenses = summary?.expenses ?? 0;
    const totalIncome = summary?.income ?? 0;
    const categories: Record<string, number> = {};

    if (transactions) {
      for (const t of transactions) {
        if (t.type === 'expense') {
          categories[t.category] = (categories[t.category] ?? 0) + t.amount;
        }
      }
    }

    const topCategoryEntry = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry
      ? `${topCategoryEntry[0]} (${topCategoryEntry[1]} руб.)`
      : 'нет данных';

    const prompt = `
      Проанализируй финансовые данные и дай одну короткую полезную подсказку (1-2 предложения):
      - Всего расходов: ${totalExpenses} руб.
      - Всего доходов: ${totalIncome} руб.
      - Самая затратная категория: ${topCategory}
      
      Примеры ответов:
      "Вы много тратите на такси. Попробуйте пользоваться общественным транспортом 2 раза в неделю, чтобы сэкономить до 3000 руб. в месяц."
      "Ваши расходы на еду выше обычного. Попробуйте планировать меню на неделю."
      
      Ответь кратко, без лишних слов.
    `;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.5:0.8b',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = (await response.json()) as { response: string };
    const insight = data.response || 'Не удалось получить подсказку';
    return NextResponse.json({ insight });
  } catch (error: unknown) {
    console.error('Insights API error:', error);
    return NextResponse.json({ insight: 'Не удалось сгенерировать подсказку' });
  }
}