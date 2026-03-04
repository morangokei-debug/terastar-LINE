import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Bell,
  Calendar,
  MessageSquare,
  ClipboardList,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: tenantData } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .select("id, name")
    .limit(1)
    .single();

  const tenantId = tenantData?.id;

  let patientsCount = 0;
  let uncheckedReplies = 0;
  let pendingSchedules = 0;
  let unreadChats = 0;
  let prescriptionRequestsCount = 0;

  if (tenantId) {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [
      patientsRes,
      repliesRes,
      schedulesRes,
      chatsRes,
      rxRequestsRes,
    ] = await Promise.all([
      supabase
        .schema("terastar_line")
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId),
      supabase
        .schema("terastar_line")
        .from("follow_up_replies")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .is("checked_at", null),
      supabase
        .schema("terastar_line")
        .from("follow_up_schedules")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .is("sent_at", null)
        .lte("scheduled_at", todayEnd.toISOString()),
      supabase
        .schema("terastar_line")
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("sender", "patient")
        .is("read_at", null),
      supabase
        .schema("terastar_line")
        .from("prescription_requests")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId),
    ]);

    patientsCount = patientsRes.count ?? 0;
    uncheckedReplies = repliesRes.count ?? 0;
    pendingSchedules = schedulesRes.count ?? 0;
    unreadChats = chatsRes.count ?? 0;
    prescriptionRequestsCount = rxRequestsRes.count ?? 0;
  }

  const cards = [
    {
      href: "/dashboard/patients",
      label: "患者数",
      value: patientsCount,
      icon: Users,
      color: "var(--accent-primary)",
    },
    {
      href: "/dashboard/prescription-requests",
      label: "処方箋リクエスト",
      value: prescriptionRequestsCount,
      icon: ClipboardList,
      color:
        prescriptionRequestsCount > 0
          ? "var(--color-warning)"
          : "var(--text-muted)",
      highlight: prescriptionRequestsCount > 0,
    },
    {
      href: "/dashboard/follow-up-replies",
      label: "未確認の返信",
      value: uncheckedReplies,
      icon: Bell,
      color:
        uncheckedReplies > 0
          ? "var(--color-error)"
          : "var(--color-success)",
      highlight: uncheckedReplies > 0,
    },
    {
      href: "/dashboard/handover/schedules",
      label: "今日の送信予定",
      value: pendingSchedules,
      icon: Calendar,
      color:
        pendingSchedules > 0
          ? "var(--color-warning)"
          : "var(--text-muted)",
    },
    {
      href: "/dashboard/chat",
      label: "未読メッセージ",
      value: unreadChats,
      icon: MessageSquare,
      color:
        unreadChats > 0
          ? "var(--color-error)"
          : "var(--color-success)",
      highlight: unreadChats > 0,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          ダッシュボード
        </h2>
        <span className="text-sm text-[var(--text-muted)]">
          {tenantData?.name ?? "—"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="block rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: card.highlight
                  ? `1px solid ${card.color}`
                  : "1px solid var(--border-color)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.label}
                </h3>
                <Icon size={18} style={{ color: card.color }} />
              </div>
              <p
                className="text-3xl font-bold"
                style={{ color: card.color }}
              >
                {card.value}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
