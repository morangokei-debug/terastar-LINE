import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ChatPage() {
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
        <h1 className="text-2xl font-bold mb-8">チャット</h1>
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

  const { data: recentMessages } = await supabase
    .schema("terastar_line")
    .from("chat_messages")
    .select("patient_id, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  const lastByPatient = new Map<string, Date>();
  for (const m of recentMessages ?? []) {
    if (!lastByPatient.has(m.patient_id)) {
      lastByPatient.set(m.patient_id, new Date(m.created_at));
    }
  }

  const withLast = (patients ?? []).map((p) => ({
    ...p,
    lastMessage: lastByPatient.get(p.id),
  }));
  withLast.sort((a, b) => {
    const da = a.lastMessage?.getTime() ?? 0;
    const db = b.lastMessage?.getTime() ?? 0;
    return db - da;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">チャット</h1>
      <p className="text-[var(--text-muted)] mb-6">
        LINE紐付け済みの患者とのやり取りを表示します。
      </p>

      {!withLast.length ? (
        <div
          className="p-12 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)]">
            LINE紐付け済みの患者がいません。患者詳細でLINEを紐付けてください。
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          {withLast.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/chat/${p.id}`}
              className="block px-6 py-4 hover:bg-[var(--bg-tertiary)] transition-colors"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{p.name}</span>
                {p.lastMessage && (
                  <span className="text-sm text-[var(--text-muted)]">
                    {p.lastMessage.toLocaleString("ja-JP")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
