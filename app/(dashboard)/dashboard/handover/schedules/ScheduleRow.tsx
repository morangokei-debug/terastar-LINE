"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  schedule: {
    id: string;
    scheduled_at: string | null;
    drug_names: string[] | null;
    patientName: string;
    patternName: string;
  };
};

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function formatJST(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

export function ScheduleRow({ schedule }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    schedule.scheduled_at ? toLocalDatetime(schedule.scheduled_at) : ""
  );
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave() {
    if (!value) return;
    setSaving(true);
    const isoDate = new Date(value).toISOString();
    const res = await fetch(`/api/follow-up-schedules/${schedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduled_at: isoDate }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleSendNow() {
    if (!confirm("このフォローアップメッセージを今すぐLINEで送信しますか？")) return;
    setSending(true);
    setSendError(null);
    const res = await fetch(
      `/api/follow-up-schedules/${schedule.id}/send`,
      { method: "POST" }
    );
    setSending(false);
    if (res.ok) {
      setSent(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setSendError(data.error ?? "送信に失敗しました");
    }
  }

  if (sent) {
    return (
      <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
        <td className="py-4 px-6">{schedule.patientName}</td>
        <td className="py-4 px-6">
          {schedule.scheduled_at ? formatJST(schedule.scheduled_at) : "—"}
        </td>
        <td className="py-4 px-6 text-[var(--text-secondary)]">
          {schedule.patternName}
        </td>
        <td className="py-4 px-6 text-sm">
          {Array.isArray(schedule.drug_names) && schedule.drug_names.length > 0
            ? schedule.drug_names.join("、")
            : "—"}
        </td>
        <td className="py-4 px-6">
          <span className="text-[var(--color-success)] font-medium">送信済み</span>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
      <td className="py-4 px-6">{schedule.patientName}</td>
      <td className="py-4 px-6">
        {editing ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-focus)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--color-success)" }}
            >
              {saving ? "…" : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setValue(
                  schedule.scheduled_at
                    ? toLocalDatetime(schedule.scheduled_at)
                    : ""
                );
              }}
              className="px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              戻す
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span>
              {schedule.scheduled_at ? formatJST(schedule.scheduled_at) : "—"}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 rounded text-xs font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--accent-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              編集
            </button>
          </div>
        )}
      </td>
      <td className="py-4 px-6 text-[var(--text-secondary)]">
        {schedule.patternName}
      </td>
      <td className="py-4 px-6 text-sm">
        {Array.isArray(schedule.drug_names) && schedule.drug_names.length > 0
          ? schedule.drug_names.join("、")
          : "—"}
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--color-warning)]">未送信</span>
          <button
            onClick={handleSendNow}
            disabled={sending}
            className="px-3 py-1 rounded text-xs font-medium text-white transition-all hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            {sending ? "送信中…" : "今すぐ送信"}
          </button>
        </div>
        {sendError && (
          <p className="text-xs text-[var(--color-error)] mt-1">{sendError}</p>
        )}
      </td>
    </tr>
  );
}
