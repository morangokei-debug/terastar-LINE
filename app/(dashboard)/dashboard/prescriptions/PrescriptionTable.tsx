"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

type Row = {
  id: string;
  status: string;
  received_at: string | null;
  pharmacy_name: string | null;
  drug_names: string[] | null;
  patient_id: string;
  patient_name: string;
};

const statusLabel: Record<string, string> = {
  received: "受付",
  preparing: "準備中",
  completed: "完了",
};

const statusColor: Record<string, string> = {
  received: "var(--text-muted)",
  preparing: "var(--color-warning)",
  completed: "var(--color-success)",
};

export function PrescriptionTable({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match =
          r.patient_name.toLowerCase().includes(q) ||
          (r.pharmacy_name ?? "").toLowerCase().includes(q) ||
          (r.drug_names ?? []).some((d) => d.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [rows, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: rows.length, received: 0, preparing: 0, completed: 0 };
    for (const r of rows) {
      if (r.status in c) c[r.status as keyof typeof c]++;
    }
    return c;
  }, [rows]);

  return (
    <div className="space-y-4">
      {/* 検索・フィルタバー */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="患者名・処方元・薬名で検索"
            className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="検索をクリア"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {(["all", "received", "preparing", "completed"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor:
                    statusFilter === s
                      ? "var(--accent-primary)"
                      : "var(--bg-secondary)",
                  color:
                    statusFilter === s ? "white" : "var(--text-secondary)",
                  border: `1px solid ${
                    statusFilter === s
                      ? "var(--accent-primary)"
                      : "var(--border-color)"
                  }`,
                }}
              >
                {s === "all"
                  ? `すべて(${counts.all})`
                  : `${statusLabel[s]}(${counts[s]})`}
              </button>
            )
          )}
        </div>
      </div>

      {/* テーブル */}
      {filtered.length === 0 ? (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)]">
            該当する処方箋がありません
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
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  患者名
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  受付日時
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  ステータス
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  処方元
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  薬名
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <td className="py-4 px-6">
                    <Link
                      href={`/dashboard/prescriptions/${p.id}`}
                      className="hover:underline font-medium"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {p.patient_name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {p.received_at
                      ? new Date(p.received_at).toLocaleString("ja-JP")
                      : "—"}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        color: statusColor[p.status],
                        backgroundColor: `color-mix(in srgb, ${statusColor[p.status]} 15%, transparent)`,
                      }}
                    >
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {p.pharmacy_name ?? "—"}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {Array.isArray(p.drug_names) && p.drug_names.length > 0
                      ? p.drug_names.join("、")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)]">
        {filtered.length}/{rows.length}件表示
      </p>
    </div>
  );
}
