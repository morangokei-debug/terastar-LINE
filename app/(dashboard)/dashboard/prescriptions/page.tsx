import { createClient } from "@/lib/supabase/server";
import { PrescriptionTable } from "./PrescriptionTable";
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

  type Row = {
    id: string;
    status: string;
    received_at: string | null;
    pharmacy_name: string | null;
    drug_names: string[] | null;
    patient_id: string;
    patient_name: string;
  };

  const rows: Row[] = (prescriptions ?? []).map((p) => {
    const patient = Array.isArray(p.patients) ? p.patients[0] : p.patients;
    return {
      id: p.id,
      status: p.status,
      received_at: p.received_at,
      pharmacy_name: p.pharmacy_name,
      drug_names: p.drug_names,
      patient_id: (patient as { id: string })?.id ?? "",
      patient_name: (patient as { name: string })?.name ?? "—",
    };
  });

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

      {rows.length === 0 ? (
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
        <PrescriptionTable rows={rows} />
      )}
    </div>
  );
}
