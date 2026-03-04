"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function PrescriptionSubmitPage() {
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("patient_name", name);
      if (memo) formData.append("memo", memo);
      if (image) formData.append("image", image);

      const res = await fetch("/api/prescription-requests", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "送信に失敗しました");
      }

      setDone(true);
      setName("");
      setMemo("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
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
            送信が完了しました
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            受付でお名前をお伝えください。
            <br />
            お薬のご用意ができましたらLINEでお知らせします。
          </p>
          <Link
            href="/welcome"
            className="text-sm text-[var(--accent-primary)] hover:underline"
          >
            トップに戻る
          </Link>
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
        <h1 className="text-xl font-bold mb-2">処方箋の送信</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          テラスターファーマシー
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
              htmlFor="memo"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              メモ（任意）
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] resize-none"
              placeholder="医療機関名、お薬についてなど"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
              処方箋の写真（任意）
            </label>
            <div className="flex gap-3">
              <label className="flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium cursor-pointer transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent-primary)", color: "white" }}>
                カメラで撮る
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setImage(f);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
              <label className="flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium cursor-pointer transition-opacity hover:opacity-90 border" style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                アルバムから選ぶ
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>
            {image && (
              <p className="mt-2 text-xs text-[var(--color-success)]">
                ✓ {image.name} を選択しました
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              JPEG/PNG/WebP、5MB以下
            </p>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            {loading ? "送信中..." : "送信する"}
          </button>
        </form>

        <p className="mt-6 text-xs text-[var(--text-muted)] text-center">
          ※処方箋の原本は来局時にご持参ください
        </p>
      </div>
    </div>
  );
}
