"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LineReturnButton } from "@/components/LineReturnButton";

function RegisterForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";

  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 120 }, (_, i) => String(currentYear - i)),
    [currentYear]
  );
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1)),
    []
  );
  const maxDay = useMemo(() => {
    if (!birthYear || !birthMonth) {
      return 31;
    }
    return new Date(Number(birthYear), Number(birthMonth), 0).getDate();
  }, [birthYear, birthMonth]);
  const dayOptions = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => String(i + 1)),
    [maxDay]
  );
  const birthDate =
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
      : "";

  useEffect(() => {
    if (birthDay && Number(birthDay) > maxDay) {
      setBirthDay("");
    }
  }, [birthDay, maxDay]);

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
          className="w-full max-w-md p-8 rounded-2xl text-center relative"
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
          <LineReturnButton
            className="inline-block w-full py-4 px-4 rounded-lg font-medium text-center cursor-pointer select-none active:opacity-90 relative z-10 border-0"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "white",
              minHeight: 48,
              touchAction: "manipulation",
            }}
          />
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            戻れない場合は、画面上部の「閉じる」または端末の戻るボタンでLINEを開いてください。
          </p>
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
              htmlFor="birthYear"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              生年月日 <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                id="birthYear"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                required
                aria-label="生年月日の年"
                className="w-full px-3 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
              >
                <option value="">年</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                id="birthMonth"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                required
                aria-label="生年月日の月"
                className="w-full px-3 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
              >
                <option value="">月</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                id="birthDay"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                required
                aria-label="生年月日の日"
                className="w-full px-3 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
              >
                <option value="">日</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
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
