import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/get-tenant";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChatView } from "./ChatView";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const tenant = await getTenant();

  const { data: patient } = await supabase
    .schema("terastar_line")
    .from("patients")
    .select("id, name, line_user_id")
    .eq("id", id)
    .single();

  if (!patient || !patient.line_user_id) notFound();

  const [{ data: messages }] = await Promise.all([
    supabase
      .schema("terastar_line")
      .from("chat_messages")
      .select("id, sender, content, image_url, created_at")
      .eq("patient_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .schema("terastar_line")
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("patient_id", id)
      .eq("sender", "patient")
      .is("read_at", null),
  ]);

  const sortedMessages = (messages ?? []).reverse();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/dashboard/chat"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-2 inline-block"
          >
            ← チャット一覧
          </Link>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
        </div>
      </div>

      <ChatView
        patientId={patient.id}
        lineUserId={patient.line_user_id}
        tenantId={tenant?.id ?? null}
        initialMessages={sortedMessages}
      />
    </div>
  );
}
