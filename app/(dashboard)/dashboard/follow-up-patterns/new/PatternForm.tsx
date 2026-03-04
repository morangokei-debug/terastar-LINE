"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PatternForm() {
  const [name, setName] = useState("");
  const [daysAfter, setDaysAfter] = useState("3");
  const [messageTemplate, setMessageTemplate] = useState(
    "{患者名}様、{薬名}をお渡ししてから{日数}日経ちました。体調はいかがですか？"
  );
  const [replyOptions, setReplyOptions] = useState("とても良い,良い,普通,悪い,とても悪い");
  const [replyThankMessage, setReplyThankMessage] = useState(
    "ご回答ありがとうございます。気になることがあればお気軽にご連絡ください。"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: tenant } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    if (!tenant) {
      setError("テナントが登録されていません");
      setLoading(false);
      return;
    }

    const options = replyOptions
      .split(/[,、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase
      .schema("terastar_line")
      .from("follow_up_patterns")
      .insert({
        tenant_id: tenant.id,
        name: name.trim(),
        days_after: parseInt(daysAfter, 10) || 3,
        message_template: messageTemplate.trim() || null,
        reply_options: options,
        reply_thank_message: replyThankMessage.trim() || null,
      });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
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
          placeholder="抗生物質"
        />
      </div>

      <div>
        <label htmlFor="daysAfter" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          送信日数（何日後に送るか）
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
          メッセージ文例（変数: {`{患者名}`} {`{薬名}`} {`{日数}`}）
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
          placeholder="とても良い,良い,普通,悪い,とても悪い"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">
          患者のLINEにボタンとして表示されます（最大13個）
        </p>
      </div>

      <div>
        <label htmlFor="replyThankMessage" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          返信後のお礼メッセージ
        </label>
        <textarea
          id="replyThankMessage"
          rows={2}
          value={replyThankMessage}
          onChange={(e) => setReplyThankMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
          placeholder="ご回答ありがとうございます。気になることがあればお気軽にご連絡ください。"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">
          患者が返信した後に自動で送られるメッセージです
        </p>
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
          {loading ? "登録中..." : "登録する"}
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
