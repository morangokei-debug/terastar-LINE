import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PrescriptionsPage() {
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
        <h1 className="text-2xl font-bold mb-8">処方箋一覧</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: prescriptions } = await supabase
    .schema("terastar_line")
    .from("prescriptions")
    .select(`
      id,
      status,
      received_at,
      pharmacy_name,
      drug_names,
      created_at,
      patients (id, name)
    `)
    .eq("tenant_id", tenant.id)
    .order("received_at", { ascending: false });

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">処方箋一覧</h1>
        <Link
          href="/dashboard/prescriptions/new"
          className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[0.99] active:scale-[0.97]"
          style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
        >
          新規登録
        </Link>
      </div>

      {!prescriptions?.length ? (
        <div
          className="p-12 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)] mb-4">処方箋がまだ登録されていません</p>
          <Link
            href="/dashboard/prescriptions/new"
            className="inline-block px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
          >
            最初の処方箋を登録する
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
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">受付日時</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">ステータス</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">処方元</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">薬名</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => {
                const patient = Array.isArray(p.patients) ? p.patients[0] : p.patients;
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td className="py-4 px-6">
                      <Link
                        href={`/dashboard/patients/${(patient as { id: string })?.id}`}
                        className="hover:underline"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        {(patient as { name: string })?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-secondary)]">
                      {p.received_at
                        ? new Date(p.received_at).toLocaleString("ja-JP")
                        : "—"}
                    </td>
                    <td className="py-4 px-6">
                      <span style={{ color: statusColor[p.status] }}>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
