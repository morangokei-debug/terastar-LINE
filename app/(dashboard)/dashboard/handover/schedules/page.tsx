import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
        <h1 className="text-2xl font-bold mb-8">フォロー送信予定</h1>
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

  const pending = schedules ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">フォロー送信予定</h1>
        <Link
          href="/dashboard/handover"
          className="px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
        >
          薬渡し入力
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
            薬渡しを登録する
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
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">送信予定日</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">パターン</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">薬名</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">状態</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => {
                const patient = Array.isArray(s.patients) ? s.patients[0] : s.patients;
                const pattern = Array.isArray(s.follow_up_patterns) ? s.follow_up_patterns[0] : s.follow_up_patterns;
                return (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td className="py-4 px-6">
                    {patient?.name ?? "—"}
                  </td>
                  <td className="py-4 px-6">
                    {s.scheduled_at
                      ? new Date(s.scheduled_at).toLocaleString("ja-JP")
                      : "—"}
                  </td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {pattern?.name ?? "—"}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {Array.isArray(s.drug_names) && s.drug_names.length > 0
                      ? s.drug_names.join("、")
                      : "—"}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[var(--color-warning)]">未送信</span>
                  </td>
                </tr>
              );
              })}
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
