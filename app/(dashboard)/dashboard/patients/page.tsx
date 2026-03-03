import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .select("id")
    .limit(1)
    .single();

  if (!tenant) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-8">患者一覧</h1>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">患者一覧</h1>
        <Link
          href="/dashboard/patients/new"
          className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[0.99] active:scale-[0.97]"
          style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
        >
          新規登録
        </Link>
      </div>

      {!patients?.length ? (
        <div
          className="p-12 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)] mb-4">患者がまだ登録されていません</p>
          <Link
            href="/dashboard/patients/new"
            className="inline-block px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
          >
            最初の患者を登録する
          </Link>
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
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">患者名</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">生年月日</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">LINE</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">登録日</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
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
