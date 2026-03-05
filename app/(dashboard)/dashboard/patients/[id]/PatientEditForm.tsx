"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function PatientEditForm({
  patientId,
  initialName,
  initialBirthDate,
}: {
  patientId: string;
  initialName: string;
  initialBirthDate: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateErr } = await supabase
      .schema("terastar_line")
      .from("patients")
      .update({
        name: name.trim() || initialName,
        birth_date: birthDate || null,
      })
      .eq("id", patientId);

    setLoading(false);
    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patient-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          患者名
        </label>
        <input
          id="patient-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
          placeholder="山田 太郎"
        />
      </div>
      <div>
        <label htmlFor="patient-birth" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          生年月日
        </label>
        <input
          id="patient-birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
        />
      </div>
      {error && (
        <p className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-40"
        style={{ backgroundColor: "var(--accent-primary)" }}
      >
        {loading ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
