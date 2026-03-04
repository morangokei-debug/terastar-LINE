"use client";

import { useState } from "react";

export function RichMenuSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSetup() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/line/richmenu");
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "設定に失敗しました" });
        return;
      }

      setMessage({ type: "ok", text: data.message || "リッチメニューを設定しました" });
    } catch {
      setMessage({ type: "error", text: "設定に失敗しました" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3 className="font-medium mb-2">LINEリッチメニュー</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        処方箋送信・ホームページ・メッセージ入力の3項目を設定します。初回のみ実行してください。
      </p>
      <button
        type="button"
        onClick={handleSetup}
        disabled={loading}
        className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-40"
        style={{ backgroundColor: "var(--accent-primary)" }}
      >
        {loading ? "設定中..." : "リッチメニューを設定する"}
      </button>
      {message && (
        <p
          className={`mt-3 text-sm ${message.type === "ok" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
          role="alert"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
