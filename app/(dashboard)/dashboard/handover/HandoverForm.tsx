"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Patient = { id: string; name: string; line_user_id: string | null };
type Pattern = { id: string; name: string; days_after: number };

export function HandoverForm({
  patients,
  patterns,
}: {
  patients: Patient[];
  patterns: Pattern[];
}) {
  const [patientId, setPatientId] = useState("");
  const [drugNames, setDrugNames] = useState("");
  const [patternId, setPatternId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!patientId || !patternId) {
      setError("患者とパターンを選択してください");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: tenant } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    if (!tenant) {
      setError("テナントが登録されていません");
      setLoading(false);
      return;
    }

    const pattern = patterns.find((p) => p.id === patternId);
    const daysAfter = pattern?.days_after ?? 3;
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + daysAfter);
    scheduledAt.setHours(9, 0, 0, 0);

    const drugs = drugNames
      .split(/[,、\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase
      .schema("terastar_line")
      .from("follow_up_schedules")
      .insert({
        tenant_id: tenant.id,
        patient_id: patientId,
        pattern_id: patternId,
        drug_names: drugs.length > 0 ? drugs : null,
        scheduled_at: scheduledAt.toISOString(),
      });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/dashboard/handover/schedules");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <div>
        <label htmlFor="patient" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          患者 <span className="text-[var(--color-error)]">*</span>
        </label>
        <select
          id="patient"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        >
          <option value="">選択してください</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.line_user_id ? "(LINE紐付け済)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="drugNames" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          薬名（カンマ区切り、任意）
        </label>
        <input
          id="drugNames"
          type="text"
          value={drugNames}
          onChange={(e) => setDrugNames(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
          placeholder="アモキシシリンカプセル"
        />
      </div>

      <div>
        <label htmlFor="pattern" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          フォロー日程パターン <span className="text-[var(--color-error)]">*</span>
        </label>
        <select
          id="pattern"
          value={patternId}
          onChange={(e) => setPatternId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        >
          <option value="">選択してください</option>
          {patterns.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}（{p.days_after}日後）
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          {loading ? "登録中..." : "登録する"}
        </button>
        <Link
          href="/dashboard/handover/schedules"
          className="inline-block px-6 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          予定一覧
        </Link>
      </div>
    </form>
  );
}
