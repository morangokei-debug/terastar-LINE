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

  const { data: summaries } = await supabase
    .schema("terastar_line")
    .from("chat_patient_summaries")
    .select("patient_id, last_sender, last_content, last_created_at, unread_count")
    .eq("tenant_id", tenant.id)
    .order("last_created_at", { ascending: false });

  const summaryByPatient = new Map((summaries ?? []).map((s) => [s.patient_id, s]));

  const withLast = (patients ?? []).map((p) => ({
    ...p,
    lastMessage: summaryByPatient.get(p.id)
      ? {
          date: new Date(summaryByPatient.get(p.id)!.last_created_at),
          content: summaryByPatient.get(p.id)!.last_content,
          sender: summaryByPatient.get(p.id)!.last_sender,
        }
      : undefined,
    unread: summaryByPatient.get(p.id)?.unread_count ?? 0,
  }));
  withLast.sort((a, b) => {
    const da = a.lastMessage?.date.getTime() ?? 0;
    const db = b.lastMessage?.date.getTime() ?? 0;
    return db - da;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">チャット</h1>
      <p className="text-[var(--text-muted)] mb-6 text-sm">
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
              style={{
                borderBottom: "1px solid var(--border-color)",
                backgroundColor:
                  p.unread > 0 ? "rgba(0, 188, 212, 0.04)" : undefined,
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {p.unread > 0 && (
                    <span
                      className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--color-error)" }}
                    >
                      {p.unread}
                    </span>
                  )}
                </div>
                {p.lastMessage && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {p.lastMessage.date.toLocaleString("ja-JP")}
                  </span>
                )}
              </div>
              {p.lastMessage && (
                <p className="text-sm text-[var(--text-muted)] truncate">
                  {p.lastMessage.sender === "pharmacist" ? "あなた: " : ""}
                  {p.lastMessage.content}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
