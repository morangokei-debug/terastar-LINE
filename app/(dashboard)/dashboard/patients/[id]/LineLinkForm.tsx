"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LineLinkForm({
  patientId,
  hasLine,
}: {
  patientId: string;
  hasLine: boolean;
}) {
  const [pending, setPending] = useState<{ id: string; line_user_id: string; created_at: string }[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: tenant } = await supabase
        .schema("terastar_line")
        .from("tenants")
        .select("id")
        .limit(1)
        .single();
      if (!tenant) return;

      const { data, error } = await supabase
        .schema("terastar_line")
        .from("line_pending")
        .select("id, line_user_id, created_at")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });
      if (!error) setPending(data ?? []);
    }
    if (!hasLine) load();
  }, [hasLine]);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || loading) return;

    setError(null);
    setLoading(true);
    const supabase = createClient();

    const item = pending.find((p) => p.id === selected);
    if (!item) {
      setError("選択が無効です");
      setLoading(false);
      return;
    }

    const { error: updateErr } = await supabase
      .schema("terastar_line")
      .from("patients")
      .update({
        line_user_id: item.line_user_id,
        linked_at: new Date().toISOString(),
      })
      .eq("id", patientId);

    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
      return;
    }

    await supabase
      .schema("terastar_line")
      .from("line_pending")
      .delete()
      .eq("id", selected);

    router.refresh();
    setLoading(false);
    setSelected("");
  }

  if (hasLine) return null;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
        LINE紐付け
      </h3>
      {pending.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          未紐付けのLINEユーザーがいません。患者にQRコードで友だち追加してもらうと、ここに表示されます。
        </p>
      ) : (
        <form onSubmit={handleLink} className="flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="pending" className="block text-xs text-[var(--text-muted)] mb-1">
              友だち追加済みのLINEユーザー
            </label>
            <select
              id="pending"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
            >
              <option value="">選択してください</option>
              {pending.map((p) => (
                <option key={p.id} value={p.id}>
                  {new Date(p.created_at).toLocaleString("ja-JP")} に友だち追加
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selected || loading}
            className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            {loading ? "紐付け中..." : "紐付ける"}
          </button>
        </form>
      )}
      {error && (
        <p className="text-sm text-[var(--color-error)] mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
