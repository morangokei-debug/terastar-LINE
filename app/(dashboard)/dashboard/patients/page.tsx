import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/get-tenant";
import Link from "next/link";

export default async function PatientsPage() {
  const supabase = await createClient();
  const tenant = await getTenant();

  if (!tenant) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-bold tracking-tight">患者一覧</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: patients } = await supabase
    .schema("terastar_line")
    .from("patients")
    .select("id, name, birth_date, line_user_id, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">患者一覧</h1>
        <Link
          href="/dashboard/patients/new"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          新規登録
        </Link>
      </div>

      {!patients?.length ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--dashboard-card-shadow)",
          }}
        >
          <p className="text-[var(--text-muted)] mb-4">患者がまだ登録されていません</p>
          <Link
            href="/dashboard/patients/new"
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            最初の患者を登録する
          </Link>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--dashboard-card-shadow)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">患者名</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">生年月日</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">LINE</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">登録日</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className="py-4 px-6">
                    <Link
                      href={`/dashboard/patients/${p.id}`}
                      className="hover:underline"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {p.birth_date ?? "—"}
                  </td>
                  <td className="py-4 px-6">
                    {p.line_user_id ? (
                      <span className="text-[var(--color-success)]">紐付け済</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">未紐付け</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-[var(--text-muted)] text-sm">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
