"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PrescriptionForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [memo, setMemo] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!uid) return;
    fetch(`/api/patient-info?line_user_id=${encodeURIComponent(uid)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.name) {
          setName(data.name);
          setPrefilled(true);
        }
        if (data.birth_date) setBirthDate(data.birth_date);
      })
      .catch(() => {});
  }, [uid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("patient_name", name);
      if (birthDate) formData.append("birth_date", birthDate);
      if (memo) formData.append("memo", memo);
      if (image) formData.append("image", image);
      if (uid) formData.append("line_user_id", uid);

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
      setBirthDate("");
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
          <button
            onClick={() => {
              try { window.close(); } catch {}
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              }
            }}
            className="text-sm text-[var(--accent-primary)] hover:underline"
          >
            LINEに戻る
          </button>
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
            {prefilled && (
              <p className="mt-1 text-xs text-[var(--color-success)]">
                前回の登録情報から入力しました
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
            >
              生年月日
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
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
                {image.name} を選択しました
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

export default function PrescriptionSubmitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">読み込み中...</p>
      </div>
    }>
      <PrescriptionForm />
    </Suspense>
  );
}
