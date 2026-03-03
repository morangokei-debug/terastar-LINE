"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender: string;
  content: string;
  created_at: string;
};

export function ChatView({
  patientId,
  lineUserId,
  initialMessages,
}: {
  patientId: string;
  lineUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setError(null);
    setLoading(true);

    const res = await fetch("/api/line/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: lineUserId, message: input.trim() }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "送信に失敗しました");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: tenant } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    if (tenant) {
      await supabase.schema("terastar_line").from("chat_messages").insert({
        tenant_id: tenant.id,
        patient_id: patientId,
        sender: "pharmacist",
        content: input.trim(),
      });
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "pharmacist",
        content: input.trim(),
        created_at: new Date().toISOString(),
      },
    ]);
    setInput("");
    setLoading(false);
  }

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        minHeight: 400,
      }}
    >
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-8">
            まだメッセージがありません
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === "pharmacist" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[80%] px-4 py-2 rounded-lg"
                style={{
                  backgroundColor:
                    m.sender === "pharmacist"
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                  color:
                    m.sender === "pharmacist"
                      ? "white"
                      : "var(--text-primary)",
                }}
              >
                <p className="text-sm">{m.content}</p>
                <p
                  className="text-xs mt-1"
                  style={{ opacity: 0.8 }}
                >
                  {new Date(m.created_at).toLocaleString("ja-JP")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="px-4 py-2 text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSend}
        className="p-4 border-t flex gap-2"
        style={{ borderColor: "var(--border-color)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力"
          className="flex-1 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 rounded-lg font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          {loading ? "送信中..." : "送信"}
        </button>
      </form>
    </div>
  );
}
