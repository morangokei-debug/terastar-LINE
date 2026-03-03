"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Patient = { id: string; name: string };

export function PrescriptionForm({
  patients,
  defaultPatientId,
}: {
  patients: Patient[];
  defaultPatientId?: string;
}) {
  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [pharmacyName, setPharmacyName] = useState("");
  const [drugNamesText, setDrugNamesText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!patientId) {
      setError("患者を選択してください");
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

    const drugNames = drugNamesText
      .split(/[、,　\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase
      .schema("terastar_line")
      .from("prescriptions")
      .insert({
        tenant_id: tenant.id,
        patient_id: patientId,
        status: "received",
        pharmacy_name: pharmacyName.trim() || null,
        drug_names: drugNames.length > 0 ? drugNames : null,
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard/prescriptions");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <div>
        <label
          htmlFor="patient"
          className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
        >
          患者 <span className="text-[var(--color-error)]">*</span>
        </label>
        <select
          id="patient"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        >
          <option value="">選択してください</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="pharmacyName"
          className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
        >
          処方元医療機関
        </label>
        <input
          id="pharmacyName"
          type="text"
          value={pharmacyName}
          onChange={(e) => setPharmacyName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          placeholder="〇〇クリニック"
        />
      </div>

      <div>
        <label
          htmlFor="drugNames"
          className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
        >
          薬名（カンマ区切り）
        </label>
        <input
          id="drugNames"
          type="text"
          value={drugNamesText}
          onChange={(e) => setDrugNamesText(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          placeholder="アモキシシリン、ロキソニン"
        />
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
          className="px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-40 hover:scale-[0.99] active:scale-[0.97]"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          {loading ? "登録中..." : "登録する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[0.99] active:scale-[0.97]"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
