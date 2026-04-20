import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/get-tenant";
import { HandoverForm } from "./HandoverForm";

export default async function HandoverPage() {
  const supabase = await createClient();
  const tenant = await getTenant();

  if (!tenant) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-bold tracking-tight">フォローアップ実施入力</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const [{ data: patients }, { data: patterns }] = await Promise.all([
    supabase
      .schema("terastar_line")
      .from("patients")
      .select("id, name, line_user_id")
      .eq("tenant_id", tenant.id)
      .order("name"),
    supabase
      .schema("terastar_line")
      .from("follow_up_patterns")
      .select("id, name, days_after")
      .eq("tenant_id", tenant.id)
      .order("name"),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">フォローアップ実施入力</h1>
      <p className="text-[var(--text-muted)] mb-6">
        患者に薬を渡したときに入力すると、フォローアップ送信が予約されます。
      </p>
      <HandoverForm
        patients={patients ?? []}
        patterns={patterns ?? []}
      />
    </div>
  );
}
