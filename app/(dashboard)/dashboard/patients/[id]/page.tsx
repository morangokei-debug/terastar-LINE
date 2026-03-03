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

  const { data: prescriptions } = await supabase
    .schema("terastar_line")
    .from("prescriptions")
    .select("id, status, received_at, pharmacy_name, drug_names, created_at")
    .eq("patient_id", id)
    .order("received_at", { ascending: false });

  const statusLabel: Record<string, string> = {
    received: "受付",
    preparing: "準備中",
    completed: "完了",
  };

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

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-[var(--text-secondary)]">処方箋履歴</h2>
        <Link
          href={`/dashboard/prescriptions/new?patient=${patient.id}`}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
        >
          処方箋を登録
        </Link>
      </div>

      {!prescriptions?.length ? (
        <p className="text-[var(--text-muted)] py-8">処方箋はまだありません</p>
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
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">受付日</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">ステータス</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">処方元</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">薬名</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td className="py-4 px-6">
                    <Link
                      href={`/dashboard/prescriptions/${p.id}`}
                      className="hover:underline"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {p.received_at
                        ? new Date(p.received_at).toLocaleString("ja-JP")
                        : "—"}
                    </Link>
                  </td>
                  <td className="py-4 px-6">{statusLabel[p.status] ?? p.status}</td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {p.pharmacy_name ?? "—"}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {Array.isArray(p.drug_names) && p.drug_names.length > 0
                      ? p.drug_names.join("、")
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
