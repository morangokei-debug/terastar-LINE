"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PatientForm() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

    const { error: insertError } = await supabase
      .schema("terastar_line")
      .from("patients")
      .insert({
        tenant_id: tenant.id,
        name: name.trim(),
        birth_date: birthDate || null,
        phone: phone.trim() || null,
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard/patients");
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
          htmlFor="name"
          className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
        >
          患者名 <span className="text-[var(--color-error)]">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          placeholder="山田 太郎"
        />
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
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium mb-2 text-[var(--text-primary)]"
        >
          電話番号
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          placeholder="090-1234-5678"
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
