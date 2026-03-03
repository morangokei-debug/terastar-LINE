"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="w-full max-w-md p-8 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h1 className="text-xl font-bold mb-4">確認メールを送信しました</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            {email} に確認リンクを送りました。メール内のリンクをクリックして登録を完了してください。
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-md p-8 rounded-xl"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">アカウント作成</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8 text-center">
          薬剤師用アカウントを新規作成
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
              placeholder="example@pharmacy.jp"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              パスワード（6文字以上）
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-40 hover:scale-[0.99] active:scale-[0.97]"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            {loading ? "送信中..." : "登録する"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          <Link href="/login" className="hover:text-[var(--accent-primary)]">
            すでにアカウントをお持ちの方はログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
