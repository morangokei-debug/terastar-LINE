"use client";

import { useState, useEffect } from "react";

export function NotificationRegister() {
  const [hasRecipient, setHasRecipient] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    const res = await fetch("/api/settings/notification");
    const data = await res.json();
    setHasRecipient(data.hasNotificationRecipient ?? false);
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleIssueToken() {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const res = await fetch("/api/settings/notification-token", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "コード発行に失敗しました");
        return;
      }

      setToken(data.token);
    } catch {
      setError("コード発行に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      const t = setTimeout(() => fetchStatus(), 3000);
      return () => clearTimeout(t);
    }
  }, [token]);

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3 className="font-medium mb-2">処方箋・チャット受信時のLINE通知</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        患者が処方箋を送信したとき、またはチャットでメッセージを送ったときに、登録したLINEアカウントにプッシュ通知が届きます。見落とし防止にご利用ください。
      </p>

      {hasRecipient === true && (
        <p className="text-sm text-[var(--color-success)] mb-4">
          ✓ 通知先が登録されています
        </p>
      )}

      {token && (
        <div
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            以下のメッセージを<strong>LINEアプリ</strong>のトーク画面で送信してください（15分以内）：
          </p>
          <p className="text-lg font-mono font-bold mb-2">
            通知登録 {token}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-2">
            ※ ダッシュボードのチャットではなく、<strong>スマホのLINEアプリ</strong>で薬局の公式アカウントを開き、そのトークに送信してください。
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            通知を受け取りたいスマホで、薬局のLINE公式アカウントを友だち追加した上で送信してください。
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-error)] mb-4" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleIssueToken}
        disabled={loading}
        className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-40"
        style={{ backgroundColor: "var(--accent-primary)" }}
      >
        {loading ? "発行中..." : token ? "コードを再発行" : "登録用コードを発行"}
      </button>
    </div>
  );
}
