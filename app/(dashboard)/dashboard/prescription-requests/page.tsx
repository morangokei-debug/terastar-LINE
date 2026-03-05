import { createClient } from "@/lib/supabase/server";

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
        <h1 className="text-2xl font-bold mb-8">受信処方箋</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: requests, error } = await supabase
    .schema("terastar_line")
    .from("prescription_requests")
    .select("id, patient_name, memo, image_url, birth_date, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[prescription-requests]", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">受信処方箋</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        LINEから患者が送信した処方箋の一覧です。
      </p>

      {error && (
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: "rgba(252, 129, 129, 0.1)",
            border: "1px solid var(--color-error)",
          }}
        >
          <p className="text-sm text-[var(--color-error)]">
            データ取得エラー: {error.message}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Supabaseで prescription_requests テーブルのマイグレーションが実行済みか確認してください。
          </p>
        </div>
      )}

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
                  生年月日
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  メモ
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  処方箋
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
                  <td className="py-4 px-6 text-sm text-[var(--text-secondary)]">
                    {r.birth_date || "—"}
                  </td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {r.memo || "—"}
                  </td>
                  <td className="py-4 px-6">
                    {r.image_url ? (
                      <a
                        href={r.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent-primary)] hover:underline text-sm"
                      >
                        画像を表示
                      </a>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-[var(--text-muted)]">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString("ja-JP", {
                          timeZone: "Asia/Tokyo",
                        })
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
