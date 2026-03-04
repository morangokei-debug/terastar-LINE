"use client";

import { useState } from "react";
import { Send, Users, UserCheck, AlertTriangle } from "lucide-react";

type Patient = { id: string; name: string; line_user_id: string | null };

export function BroadcastForm({ patients }: { patients: Patient[] }) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"broadcast" | "multicast">("broadcast");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function togglePatient(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === patients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(patients.map((p) => p.id)));
    }
  }

  function canSend() {
    if (!message.trim()) return false;
    if (mode === "multicast" && selectedIds.size === 0) return false;
    return true;
  }

  async function handleSend() {
    if (!canSend()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/line/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          mode,
          patientIds: mode === "multicast" ? Array.from(selectedIds) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data.error ?? "送信に失敗しました" });
      } else {
        const target =
          mode === "broadcast"
            ? "友だち全員"
            : `${data.sent ?? selectedIds.size}人`;
        setResult({ type: "success", text: `${target}に送信しました` });
        setMessage("");
        setShowPreview(false);
      }
    } catch {
      setResult({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* 送信モード選択 */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <label className="block text-sm font-medium mb-4 text-[var(--text-primary)]">
          送信先
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("broadcast")}
            className="flex items-center gap-3 rounded-lg p-4 transition-all text-left"
            style={{
              backgroundColor:
                mode === "broadcast"
                  ? "var(--accent-primary)"
                  : "var(--bg-tertiary)",
              color: mode === "broadcast" ? "white" : "var(--text-primary)",
              border:
                mode === "broadcast"
                  ? "2px solid var(--accent-primary)"
                  : "1px solid var(--border-color)",
            }}
          >
            <Users size={20} />
            <div>
              <p className="font-medium">友だち全員</p>
              <p
                className="text-xs mt-0.5"
                style={{ opacity: 0.8 }}
              >
                全員に一斉送信
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode("multicast")}
            className="flex items-center gap-3 rounded-lg p-4 transition-all text-left"
            style={{
              backgroundColor:
                mode === "multicast"
                  ? "var(--accent-primary)"
                  : "var(--bg-tertiary)",
              color: mode === "multicast" ? "white" : "var(--text-primary)",
              border:
                mode === "multicast"
                  ? "2px solid var(--accent-primary)"
                  : "1px solid var(--border-color)",
            }}
          >
            <UserCheck size={20} />
            <div>
              <p className="font-medium">患者を選択</p>
              <p
                className="text-xs mt-0.5"
                style={{ opacity: 0.8 }}
              >
                指定した患者のみ
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* マルチキャスト時の患者選択 */}
      {mode === "multicast" && (
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              送信先の患者（{selectedIds.size}人選択中）
            </label>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs px-3 py-1.5 rounded-md"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--accent-primary)",
              }}
            >
              {selectedIds.size === patients.length
                ? "すべて解除"
                : "すべて選択"}
            </button>
          </div>

          {patients.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              LINE紐付け済みの患者がいません
            </p>
          ) : (
            <div
              className="max-h-60 overflow-y-auto rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              {patients.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => togglePatient(p.id)}
                    className="w-4 h-4 rounded accent-[var(--accent-primary)]"
                  />
                  <span className="text-sm">{p.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* メッセージ入力 */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <label
          htmlFor="broadcast-message"
          className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
        >
          メッセージ <span className="text-[var(--color-error)]">*</span>
        </label>
        <textarea
          id="broadcast-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] resize-none"
          placeholder="例：本日は臨時休業とさせていただきます。ご迷惑をおかけし申し訳ございません。"
        />
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {message.length}文字
          {mode === "broadcast"
            ? " ・ 友だち全員に送信されます（送信人数分が料金対象）"
            : ` ・ ${selectedIds.size}人に送信されます`}
        </p>
      </div>

      {/* 結果表示 */}
      {result && (
        <div
          className="rounded-xl px-6 py-4 text-sm font-medium"
          role="alert"
          style={{
            backgroundColor:
              result.type === "success"
                ? "rgba(72, 187, 120, 0.15)"
                : "rgba(252, 129, 129, 0.15)",
            color:
              result.type === "success"
                ? "var(--color-success)"
                : "var(--color-error)",
            border: `1px solid ${
              result.type === "success"
                ? "var(--color-success)"
                : "var(--color-error)"
            }`,
          }}
        >
          {result.text}
        </div>
      )}

      {/* プレビュー確認・送信 */}
      {!showPreview ? (
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={!canSend()}
          className="w-full py-3 rounded-lg font-medium text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          送信内容を確認する
        </button>
      ) : (
        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "2px solid var(--color-warning)",
          }}
        >
          <div className="flex items-center gap-2 text-[var(--color-warning)]">
            <AlertTriangle size={18} />
            <span className="font-medium">送信前の確認</span>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--text-muted)]">送信先：</span>{" "}
              {mode === "broadcast"
                ? "友だち全員"
                : `選択した${selectedIds.size}人`}
            </p>
            <p className="text-[var(--text-muted)]">メッセージ：</p>
            <div
              className="rounded-lg p-4 whitespace-pre-wrap text-sm"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
              }}
            >
              {message}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: "var(--accent-primary)" }}
            >
              <Send size={16} />
              {loading ? "送信中..." : "送信する"}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
