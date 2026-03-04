import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LineLinkForm } from "./LineLinkForm";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .schema("terastar_line")
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/dashboard/patients"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-2 inline-block"
          >
            ← 患者一覧
          </Link>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
        </div>
      </div>

      <div
        className="p-6 rounded-xl mb-8"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 className="font-medium mb-4 text-[var(--text-secondary)]">基本情報</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--text-muted)]">生年月日</dt>
            <dd>{patient.birth_date ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-muted)]">電話番号</dt>
            <dd>{patient.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-muted)]">LINE</dt>
            <dd>
              {patient.line_user_id ? (
                <span className="text-[var(--color-success)]">紐付け済</span>
              ) : (
                <span className="text-[var(--text-muted)]">未紐付け</span>
              )}
            </dd>
          </div>
        </dl>
        <LineLinkForm patientId={patient.id} hasLine={!!patient.line_user_id} />
      </div>
    </div>
  );
}
