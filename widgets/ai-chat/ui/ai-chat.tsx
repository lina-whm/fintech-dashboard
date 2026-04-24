"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function AIChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Привет! Я AI-ассистент. Спроси меня о чём угодно." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const reply = data.reply || "Ошибка: не удалось получить ответ";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ошибка соединения с сервером" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-soft border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 !gap-0 !py-0">
      <CardHeader className="pb-1 px-3">
        <CardTitle className="text-sm">💬 AI-ассистент</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-0">
        <div className="h-48 sm:h-80 overflow-y-auto space-y-2 mb-3 border rounded-md p-2 dark:border-gray-700 dark:bg-gray-900/50">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block p-2 rounded max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted dark:bg-gray-700"}`}>{m.content}</span>
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground dark:text-gray-400">Думаю...</div>}
        </div>
        <div className="flex gap-2 pt-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Спроси о финансах..."
            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
          <Button onClick={sendMessage} disabled={loading}>Отправить</Button>
        </div>
      </CardContent>
    </Card>
  );
}