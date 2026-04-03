import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/get-tenant";
import { BroadcastForm } from "./BroadcastForm";

export default async function BroadcastPage() {
  const supabase = await createClient();
  const tenant = await getTenant();

  if (!tenant) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-8">一斉送信</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: patients } = await supabase
    .schema("terastar_line")
    .from("patients")
    .select("id, name, line_user_id")
    .eq("tenant_id", tenant.id)
    .not("line_user_id", "is", null)
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">一斉送信</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        LINE友だち全員、または選択した患者にメッセージを一斉送信します。
      </p>
      <BroadcastForm patients={patients ?? []} />
    </div>
  );
}
