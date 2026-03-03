"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Pattern = {
  id: string;
  name: string;
  days_after: number;
  message_template: string | null;
  reply_options: string[];
  reply_thank_message: string | null;
};

export function PatternEditForm({ pattern }: { pattern: Pattern }) {
  const [name, setName] = useState(pattern.name);
  const [daysAfter, setDaysAfter] = useState(String(pattern.days_after));
  const [messageTemplate, setMessageTemplate] = useState(
    pattern.message_template ?? ""
  );
  const [replyOptions, setReplyOptions] = useState(
    Array.isArray(pattern.reply_options)
      ? pattern.reply_options.join(",")
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const options = replyOptions
      .split(/[,、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: updateError } = await supabase
      .schema("terastar_line")
      .from("follow_up_patterns")
      .update({
        name: name.trim(),
        days_after: parseInt(daysAfter, 10) || 3,
        message_template: messageTemplate.trim() || null,
        reply_options: options,
      })
      .eq("id", pattern.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/dashboard/follow-up-patterns");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          パターン名 <span className="text-[var(--color-error)]">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label htmlFor="daysAfter" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          送信日数
        </label>
        <input
          id="daysAfter"
          type="number"
          min={1}
          value={daysAfter}
          onChange={(e) => setDaysAfter(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label htmlFor="messageTemplate" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          メッセージ文例
        </label>
        <textarea
          id="messageTemplate"
          rows={3}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label htmlFor="replyOptions" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          返信選択肢（カンマ区切り）
        </label>
        <input
          id="replyOptions"
          type="text"
          value={replyOptions}
          onChange={(e) => setReplyOptions(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          {loading ? "保存中..." : "保存する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
