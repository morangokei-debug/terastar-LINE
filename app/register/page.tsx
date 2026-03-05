"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) {
      setError("無効なアクセスです。LINEから開いてください。");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_user_id: uid,
          name,
          birth_date: birthDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "登録に失敗しました");
      }

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md p-8 rounded-2xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-lg font-medium text-[var(--color-success)] mb-4">
            登録が完了しました
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            ありがとうございます。
            <br />
            次回からお名前が自動入力されます。
          </p>
          <a
            href="https://line.me/R/nv/chat"
            className="inline-block w-full py-3 px-4 rounded-lg font-medium text-center"
            style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
          >
            LINEに戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h1 className="text-xl font-bold mb-2">お名前の登録</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          テラスターファーマシー
          <br />
          処方箋送信時に自動入力されます
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              お名前 <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              生年月日 <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !uid}
            className="w-full py-3 px-4 rounded-lg font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">読み込み中...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
