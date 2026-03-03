"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StatusUpdateForm({
  prescriptionId,
  currentStatus,
  patientLineUserId,
}: {
  prescriptionId: string;
  currentStatus: string;
  patientLineUserId?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/prescriptions/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prescriptionId,
        status,
        notifyLine: status === "completed" && !!patientLineUserId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "更新に失敗しました");
      return;
    }

    router.refresh();
  }

  const statusOptions = [
    { value: "received", label: "受付" },
    { value: "preparing", label: "準備中" },
    { value: "completed", label: "完了" },
  ] as const;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <h2 className="font-medium mb-4 text-[var(--text-secondary)]">ステータスを変更</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        {statusOptions.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="status"
              value={opt.value}
              checked={status === opt.value}
              onChange={() => setStatus(opt.value)}
              className="accent-[var(--accent-primary)]"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {status === "completed" && patientLineUserId && (
        <p className="text-sm text-[var(--color-success)] mb-4">
          ※ 完了に変更すると、患者へLINEで通知を送信します
        </p>
      )}
      {status === "completed" && !patientLineUserId && (
        <p className="text-sm text-[var(--text-muted)] mb-4">
          ※ 患者がLINE未紐付けのため、通知は送信されません
        </p>
      )}
      {error && (
        <p className="text-sm text-[var(--color-error)] mb-4" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-40 hover:scale-[0.99] active:scale-[0.97]"
        style={{ backgroundColor: "var(--accent-primary)" }}
      >
        {loading ? "更新中..." : "更新する"}
      </button>
    </form>
  );
}
