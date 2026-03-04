import { createClient } from "@/lib/supabase/server";
import { ReplyList } from "./ReplyList";

export default async function FollowUpRepliesPage() {
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
        <h1 className="text-2xl font-bold mb-8">フォロー返信</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: replies } = await supabase
    .schema("terastar_line")
    .from("follow_up_replies")
    .select(
      `id, reply_type, reply_text, replied_at, checked_at,
       patients(id, name),
       follow_up_schedules(id, drug_names, follow_up_patterns(name))`
    )
    .eq("tenant_id", tenant.id)
    .order("replied_at", { ascending: false })
    .limit(100);

  type ReplyRow = {
    id: string;
    reply_text: string | null;
    reply_type: string | null;
    replied_at: string;
    checked_at: string | null;
    patient_name: string;
    patient_id: string;
    pattern_name: string | null;
    drug_names: string[] | null;
  };

  const rows: ReplyRow[] = (replies ?? []).map((r) => {
    const patient = Array.isArray(r.patients) ? r.patients[0] : r.patients;
    const schedule = Array.isArray(r.follow_up_schedules)
      ? r.follow_up_schedules[0]
      : r.follow_up_schedules;
    const pattern = schedule
      ? Array.isArray(schedule.follow_up_patterns)
        ? schedule.follow_up_patterns[0]
        : schedule.follow_up_patterns
      : null;

    return {
      id: r.id,
      reply_text: r.reply_text,
      reply_type: r.reply_type,
      replied_at: r.replied_at,
      checked_at: r.checked_at,
      patient_name: patient?.name ?? "不明",
      patient_id: patient?.id ?? "",
      pattern_name: pattern?.name ?? null,
      drug_names: schedule?.drug_names ?? null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">フォロー返信</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        フォローアップに対する患者からの返信一覧です。
      </p>
      <ReplyList initialReplies={rows} />
    </div>
  );
}
