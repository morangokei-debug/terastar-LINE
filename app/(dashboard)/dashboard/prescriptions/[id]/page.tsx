import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusUpdateForm } from "./StatusUpdateForm";

export default async function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prescription } = await supabase
    .schema("terastar_line")
    .from("prescriptions")
    .select(`
      *,
      patients (id, name, line_user_id)
    `)
    .eq("id", id)
    .single();

  if (!prescription) notFound();

  const patient = Array.isArray(prescription.patients)
    ? prescription.patients[0]
    : prescription.patients;

  const statusLabel: Record<string, string> = {
    received: "受付",
    preparing: "準備中",
    completed: "完了",
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/prescriptions"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-2 inline-block"
        >
          ← 処方箋一覧
        </Link>
        <h1 className="text-2xl font-bold">
          処方箋詳細
          <span className="ml-3 text-lg font-normal text-[var(--text-secondary)]">
            {statusLabel[prescription.status]}
          </span>
        </h1>
      </div>

      <div
        className="p-6 rounded-xl mb-8"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 className="font-medium mb-4 text-[var(--text-secondary)]">処方箋情報</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--text-muted)]">患者</dt>
            <dd>
              <Link
                href={`/dashboard/patients/${(patient as { id: string })?.id}`}
                className="hover:underline"
                style={{ color: "var(--accent-primary)" }}
              >
                {(patient as { name: string })?.name ?? "—"}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-muted)]">受付日時</dt>
            <dd>
              {prescription.received_at
                ? new Date(prescription.received_at).toLocaleString("ja-JP")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-muted)]">処方元</dt>
            <dd>{prescription.pharmacy_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-muted)]">薬名</dt>
            <dd>
              {Array.isArray(prescription.drug_names) && prescription.drug_names.length > 0
                ? prescription.drug_names.join("、")
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <StatusUpdateForm
        prescriptionId={prescription.id}
        currentStatus={prescription.status}
        patientLineUserId={(patient as { line_user_id?: string })?.line_user_id}
      />
    </div>
  );
}
