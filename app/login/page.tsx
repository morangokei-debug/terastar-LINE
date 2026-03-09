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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-app)" }}>
      <div
        className="w-full max-w-md p-8 rounded-lg"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        }}
      >
        <h1 className="text-xl font-semibold mb-2 text-center" style={{ color: "var(--text-primary)" }}>
          テラスターファーマシー
        </h1>
        <p className="text-sm mb-8 text-center" style={{ color: "var(--text-muted)" }}>
          LINEフォローアップ
        </p>

        <p className="mb-6 text-center text-sm space-x-4" style={{ color: "var(--text-muted)" }}>
          <a href="/welcome" className="hover:text-[var(--accent)] transition-colors" style={{ transition: "var(--t-fast)" }}>
            患者の方はLINE友だち追加
          </a>
          <span>|</span>
          <a href="/login/signup" className="hover:text-[var(--accent)] transition-colors" style={{ transition: "var(--t-fast)" }}>
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
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)]"
              style={{
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                transition: "var(--t-fast)",
              }}
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
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)]"
              style={{
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                transition: "var(--t-fast)",
              }}
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
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-40 hover:bg-[var(--accent-hover)]"
            style={{
              backgroundColor: "var(--accent)",
              transition: "var(--t-base)",
            }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
