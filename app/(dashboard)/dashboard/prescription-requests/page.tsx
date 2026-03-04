import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PrescriptionRequestsPage() {
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
        <h1 className="text-2xl font-bold mb-8">処方箋送信リクエスト</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: requests } = await supabase
    .schema("terastar_line")
    .from("prescription_requests")
    .select("id, patient_name, memo, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">処方箋送信リクエスト</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        リッチメニュー「処方箋送信」から患者が送信した内容です。患者登録・処方箋登録の参考にしてください。
      </p>

      {!requests || requests.length === 0 ? (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)]">リクエストはまだありません</p>
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
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  お名前
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  メモ
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  送信日時
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td className="py-4 px-6 font-medium">{r.patient_name}</td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {r.memo || "—"}
                  </td>
                  <td className="py-4 px-6 text-sm text-[var(--text-muted)]">
                    {new Date(r.created_at).toLocaleString("ja-JP")}
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
