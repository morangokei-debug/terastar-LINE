"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.refresh();
    router.push("/dashboard");
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
        <h1 className="text-2xl font-bold mb-6 text-center">
          テラスターファーマシー LINEフォローアップ
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8 text-center">
          薬剤師用ログイン
        </p>

        <p className="mb-6 text-center text-sm text-[var(--text-muted)] space-x-4">
          <a href="/welcome" className="hover:text-[var(--accent-primary)]">
            患者の方はLINE友だち追加
          </a>
          <span>|</span>
          <a href="/login/signup" className="hover:text-[var(--accent-primary)]">
            初めての方はアカウント作成
          </a>
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
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
              placeholder="example@pharmacy.jp"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
            />
          </div>

          {error && (
            <p
              className="text-sm text-[var(--color-error)]"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-40 hover:scale-[0.99] active:scale-[0.97]"
            style={{
              backgroundColor: "var(--accent-primary)",
            }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
