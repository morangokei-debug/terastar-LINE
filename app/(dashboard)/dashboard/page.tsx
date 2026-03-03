import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: tenantData } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .select("id, name")
    .limit(1)
    .single();

  const tenantId = tenantData?.id;

  let patientsCount = 0;
  let prescriptionsCount = 0;

  if (tenantId) {
    const [patientsRes, prescriptionsRes] = await Promise.all([
      supabase.schema("terastar_line").from("patients").select("id", { count: "exact", head: true }),
      supabase.schema("terastar_line").from("prescriptions").select("id", { count: "exact", head: true }),
    ]);
    patientsCount = patientsRes.count ?? 0;
    prescriptionsCount = prescriptionsRes.count ?? 0;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">ダッシュボード</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/patients"
          className="block p-6 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h3 className="font-medium text-[var(--text-secondary)] mb-2">患者数</h3>
          <p className="text-3xl font-bold" style={{ color: "var(--accent-primary)" }}>
            {patientsCount}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">患者一覧へ →</p>
        </Link>

        <Link
          href="/dashboard/prescriptions"
          className="block p-6 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h3 className="font-medium text-[var(--text-secondary)] mb-2">処方箋数</h3>
          <p className="text-3xl font-bold" style={{ color: "var(--accent-primary)" }}>
            {prescriptionsCount}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">処方箋一覧へ →</p>
        </Link>

        <div
          className="block p-6 rounded-xl"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h3 className="font-medium text-[var(--text-secondary)] mb-2">薬局</h3>
          <p className="text-lg font-medium">{tenantData?.name ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
