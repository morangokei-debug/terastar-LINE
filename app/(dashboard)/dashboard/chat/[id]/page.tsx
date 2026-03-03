import { createClient } from "@/lib/supabase/server";
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

  const { data: patient } = await supabase
    .schema("terastar_line")
    .from("patients")
    .select("id, name, line_user_id")
    .eq("id", id)
    .single();

  if (!patient || !patient.line_user_id) notFound();

  const { data: messages } = await supabase
    .schema("terastar_line")
    .from("chat_messages")
    .select("id, sender, content, created_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: true });

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
        initialMessages={messages ?? []}
      />
    </div>
  );
}
