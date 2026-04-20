import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/get-tenant";
import Link from "next/link";

export default async function PrescriptionRequestsPage() {
  const supabase = await createClient();
  const tenant = await getTenant();

  if (!tenant) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-bold tracking-tight">受信処方箋</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: requests, error } = await supabase
    .schema("terastar_line")
    .from("prescription_requests")
    .select("id, patient_name, memo, image_url, birth_date, created_at, line_user_id")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[prescription-requests]", error);
  }

  const lineUserIds = [
    ...new Set(
      (requests ?? [])
        .map((r) => r.line_user_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  let patientIdByLineUserId = new Map<string, string>();
  if (lineUserIds.length > 0) {
    const { data: linkedPatients } = await supabase
      .schema("terastar_line")
      .from("patients")
      .select("id, line_user_id")
      .eq("tenant_id", tenant.id)
      .in("line_user_id", lineUserIds);

    patientIdByLineUserId = new Map(
      (linkedPatients ?? []).map((p) => [p.line_user_id as string, p.id])
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">受信処方箋</h1>
      <p className="text-sm text-[var(--text-muted)] mb-2">
        LINEから患者が送信した処方箋の一覧です。
      </p>
      <p className="text-xs text-[var(--text-muted)] mb-6">
        「チャットを開く」は、患者一覧でLINEが紐付いている場合のみ表示されます。
      </p>

      {error && (
        <div
          className="mb-6 rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(252, 129, 129, 0.1)",
            border: "1px solid var(--color-error)",
            boxShadow: "var(--dashboard-card-shadow)",
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
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--dashboard-card-shadow)",
          }}
        >
          <p className="text-[var(--text-muted)]">リクエストはまだありません</p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--dashboard-card-shadow)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr>
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
                  チャット
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
              {requests.map((r) => {
                const chatPatientId = r.line_user_id
                  ? patientIdByLineUserId.get(r.line_user_id)
                  : undefined;
                return (
                <tr key={r.id}>
                  <td className="py-4 px-6 font-medium">{r.patient_name}</td>
                  <td className="py-4 px-6 text-sm text-[var(--text-secondary)]">
                    {r.birth_date || "—"}
                  </td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {r.memo || "—"}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {chatPatientId ? (
                      <Link
                        href={`/dashboard/chat/${chatPatientId}`}
                        className="inline-flex items-center gap-1 font-medium text-[var(--accent-primary)] hover:underline"
                      >
                        チャットを開く
                      </Link>
                    ) : r.line_user_id ? (
                      <span
                        className="text-[var(--text-muted)]"
                        title="このLINEユーザーに対応する患者が患者一覧に未登録です"
                      >
                        患者未登録
                      </span>
                    ) : (
                      <span
                        className="text-[var(--text-muted)]"
                        title="処方箋送信時のLINE情報が無いためチャットへリンクできません"
                      >
                        —
                      </span>
                    )}
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
              );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
