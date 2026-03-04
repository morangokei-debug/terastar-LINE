"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat-${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "terastar_line",
          table: "chat_messages",
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            sender: string;
            content: string;
            created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender === "patient") {
            supabase
              .schema("terastar_line")
              .from("chat_messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMsg.id)
              .then(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId]);

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
        height: "calc(100vh - 220px)",
        minHeight: 400,
      }}
    >
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
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
                className="max-w-[75%] px-4 py-2.5 rounded-2xl"
                style={{
                  backgroundColor:
                    m.sender === "pharmacist"
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                  color:
                    m.sender === "pharmacist"
                      ? "white"
                      : "var(--text-primary)",
                  borderBottomRightRadius:
                    m.sender === "pharmacist" ? "4px" : undefined,
                  borderBottomLeftRadius:
                    m.sender !== "pharmacist" ? "4px" : undefined,
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                  {new Date(m.created_at).toLocaleString("ja-JP")}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p
          className="px-4 py-2 text-sm text-[var(--color-error)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSend}
        className="p-3 border-t flex gap-2"
        style={{ borderColor: "var(--border-color)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力"
          className="flex-1 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-3 rounded-lg font-medium text-white disabled:opacity-40 flex items-center gap-2"
          style={{ backgroundColor: "var(--accent-primary)" }}
          aria-label="送信"
        >
          <Send size={16} />
          <span className="hidden sm:inline">
            {loading ? "送信中..." : "送信"}
          </span>
        </button>
      </form>
    </div>
  );
}
