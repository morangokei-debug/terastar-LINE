"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Circle } from "lucide-react";

type ReplyRow = {
  id: string;
  reply_text: string | null;
  reply_type: string | null;
  replied_at: string;
  checked_at: string | null;
  patient_name: string;
  patient_id: string;
  pattern_name: string | null;
  drug_names: string[] | null;
};

export function ReplyList({
  initialReplies,
}: {
  initialReplies: ReplyRow[];
}) {
  const [replies, setReplies] = useState(initialReplies);
  const [filter, setFilter] = useState<"all" | "unchecked">("unchecked");

  const filtered =
    filter === "unchecked"
      ? replies.filter((r) => !r.checked_at)
      : replies;

  const uncheckedCount = replies.filter((r) => !r.checked_at).length;

  async function markChecked(id: string) {
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .schema("terastar_line")
      .from("follow_up_replies")
      .update({ checked_at: now })
      .eq("id", id);

    setReplies((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checked_at: now } : r))
    );
  }

  async function markAllChecked() {
    const unchecked = replies.filter((r) => !r.checked_at);
    if (unchecked.length === 0) return;

    const supabase = createClient();
    const now = new Date().toISOString();
    const ids = unchecked.map((r) => r.id);

    await supabase
      .schema("terastar_line")
      .from("follow_up_replies")
      .update({ checked_at: now })
      .in("id", ids);

    setReplies((prev) =>
      prev.map((r) =>
        ids.includes(r.id) ? { ...r, checked_at: now } : r
      )
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルタ・操作バー */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("unchecked")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                filter === "unchecked"
                  ? "var(--accent-primary)"
                  : "var(--bg-tertiary)",
              color: filter === "unchecked" ? "white" : "var(--text-secondary)",
            }}
          >
            未確認
            {uncheckedCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-[var(--color-error)] text-white">
                {uncheckedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("all")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                filter === "all"
                  ? "var(--accent-primary)"
                  : "var(--bg-tertiary)",
              color: filter === "all" ? "white" : "var(--text-secondary)",
            }}
          >
            すべて
          </button>
        </div>

        {uncheckedCount > 0 && (
          <button
            onClick={markAllChecked}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--accent-primary)",
            }}
          >
            すべて確認済みにする
          </button>
        )}
      </div>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <div
          className="p-12 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)]">
            {filter === "unchecked"
              ? "未確認の返信はありません"
              : "返信はまだありません"}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-start gap-4 px-6 py-4 transition-colors"
              style={{
                borderBottom: "1px solid var(--border-color)",
                backgroundColor: r.checked_at
                  ? "transparent"
                  : "rgba(0, 188, 212, 0.04)",
              }}
            >
              {/* 確認ボタン */}
              <button
                onClick={() => !r.checked_at && markChecked(r.id)}
                className="mt-0.5 flex-shrink-0"
                aria-label={
                  r.checked_at ? "確認済み" : "確認済みにする"
                }
                disabled={!!r.checked_at}
              >
                {r.checked_at ? (
                  <CheckCircle
                    size={20}
                    className="text-[var(--color-success)]"
                  />
                ) : (
                  <Circle
                    size={20}
                    className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
                  />
                )}
              </button>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/dashboard/patients/${r.patient_id}`}
                    className="font-medium hover:underline"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {r.patient_name}
                  </Link>
                  {r.pattern_name && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {r.pattern_name}
                    </span>
                  )}
                  {r.drug_names && r.drug_names.length > 0 && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {r.drug_names.join("、")}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: r.checked_at
                      ? "var(--text-secondary)"
                      : "var(--text-primary)",
                  }}
                >
                  {r.reply_text || "—"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {new Date(r.replied_at).toLocaleString("ja-JP")}
                  {r.checked_at && (
                    <span className="ml-2">
                      ✓ 確認済み（
                      {new Date(r.checked_at).toLocaleString("ja-JP")}）
                    </span>
                  )}
                </p>
              </div>

              {/* チャットリンク */}
              <Link
                href={`/dashboard/chat/${r.patient_id}`}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--accent-primary)",
                }}
              >
                チャット
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
