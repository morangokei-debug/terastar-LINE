import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ScheduleRow } from "./ScheduleRow";

export default async function HandoverSchedulesPage() {
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
        <h1 className="text-2xl font-bold mb-8">フォローアップ送信予定</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: schedules } = await supabase
    .schema("terastar_line")
    .from("follow_up_schedules")
    .select(
      "id, scheduled_at, sent_at, drug_names, patient_id, pattern_id, patients(name), follow_up_patterns(name)"
    )
    .eq("tenant_id", tenant.id)
    .is("sent_at", null)
    .order("scheduled_at", { ascending: true });

  const pending = (schedules ?? []).map((s) => {
    const patient = Array.isArray(s.patients) ? s.patients[0] : s.patients;
    const pattern = Array.isArray(s.follow_up_patterns)
      ? s.follow_up_patterns[0]
      : s.follow_up_patterns;
    return {
      id: s.id,
      scheduled_at: s.scheduled_at,
      drug_names: s.drug_names,
      patientName: (patient as { name?: string })?.name ?? "—",
      patternName: (pattern as { name?: string })?.name ?? "—",
    };
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">フォローアップ送信予定</h1>
        <Link
          href="/dashboard/handover"
          className="px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
        >
          フォローアップ実施入力
        </Link>
      </div>

      {!pending.length ? (
        <div
          className="p-12 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)] mb-4">送信予定はありません</p>
          <Link
            href="/dashboard/handover"
            className="inline-block px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
          >
            フォローアップを入力する
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
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">送信予定日時</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">パターン</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">薬名</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">状態</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => (
                <ScheduleRow key={s.id} schedule={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-sm text-[var(--text-muted)]">
        送信は Cron（毎日9時など）で自動実行されます。Vercel Cron の設定が必要です。
      </p>
    </div>
  );
}
