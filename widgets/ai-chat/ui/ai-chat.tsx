"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { MessageCircle, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Привет! Я твой финансовый ассистент. Задавай вопросы о расходах." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка сервера");
      }

      const data = await response.json();
      
      if (!data.message) {
        throw new Error("Пустой ответ от сервера");
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message);
      setMessages(prev => [...prev, { role: "assistant", content: "Извините, произошла ошибка. Попробуйте позже." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-soft h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Финансовый ассистент (AI)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-auto">
        <div className="flex-1 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 text-sm">
                <span className="animate-pulse">Думаю...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive text-center">
              Ошибка: {error}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Спроси о финансах..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}