import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/get-tenant";
import Link from "next/link";
import {
  Users,
  Bell,
  MessageSquare,
  FileImage,
  Calendar,
  ChevronRight,
  Inbox,
} from "lucide-react";

function japanTodayRangeIso(): { start: string; end: string } {
  const dayStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  return {
    start: `${dayStr}T00:00:00+09:00`,
    end: `${dayStr}T23:59:59.999+09:00`,
  };
}

function formatRelativeJa(d: Date): string {
  const diff = Date.now() - d.getTime();
  if (diff < 0) return "たった今";
  const s = Math.floor(diff / 1000);
  if (s < 60) return "たった今";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const days = Math.floor(h / 24);
  return `${days}日前`;
}

function patientNameFromJoin(row: {
  patients?: { name: string } | { name: string }[] | null;
}): string {
  const p = row.patients;
  if (!p) return "患者";
  if (Array.isArray(p)) return p[0]?.name ?? "患者";
  return p.name ?? "患者";
}

type ActivityItem = {
  id: string;
  name: string;
  tag: string;
  variant: "ok" | "warn" | "info";
  at: Date;
  href: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const tenantData = await getTenant();
  const tenantId = tenantData?.id;
  const { start: todayStart, end: todayEnd } = japanTodayRangeIso();

  const dateLabel = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  let patientsCount = 0;
  let uncheckedReplies = 0;
  let pendingSchedules = 0;
  let unreadChats = 0;
  let prescriptionRequestsCount = 0;
  let scheduleRows: {
    id: string;
    scheduled_at: string;
    patients: { name: string } | { name: string }[] | null;
  }[] = [];
  const activityItems: ActivityItem[] = [];

  if (tenantId) {
    const [
      patientsRes,
      repliesRes,
      schedulesCountRes,
      schedulesListRes,
      chatsRes,
      rxRequestsRes,
      recentRepliesRes,
      recentRxRes,
      recentChatRes,
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
        .gte("scheduled_at", todayStart)
        .lte("scheduled_at", todayEnd),
      supabase
        .schema("terastar_line")
        .from("follow_up_schedules")
        .select("id, scheduled_at, patients(name)")
        .eq("tenant_id", tenantId)
        .is("sent_at", null)
        .gte("scheduled_at", todayStart)
        .lte("scheduled_at", todayEnd)
        .order("scheduled_at", { ascending: true })
        .limit(8),
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
      supabase
        .schema("terastar_line")
        .from("follow_up_replies")
        .select("id, replied_at, checked_at, patients(name)")
        .eq("tenant_id", tenantId)
        .order("replied_at", { ascending: false })
        .limit(6),
      supabase
        .schema("terastar_line")
        .from("prescription_requests")
        .select("id, patient_name, created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .schema("terastar_line")
        .from("chat_messages")
        .select("id, created_at, read_at, sender, patient_id, patients(name)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    patientsCount = patientsRes.count ?? 0;
    uncheckedReplies = repliesRes.count ?? 0;
    pendingSchedules = schedulesCountRes.count ?? 0;
    unreadChats = chatsRes.count ?? 0;
    prescriptionRequestsCount = rxRequestsRes.count ?? 0;

    scheduleRows = (schedulesListRes.data ?? []) as unknown as typeof scheduleRows;

    for (const r of recentRepliesRes.data ?? []) {
      const row = r as unknown as {
        id: string;
        replied_at: string;
        checked_at: string | null;
        patients?: { name: string } | { name: string }[] | null;
      };
      activityItems.push({
        id: `r-${row.id}`,
        name: patientNameFromJoin(row),
        tag: row.checked_at ? "返信済み" : "未確認",
        variant: row.checked_at ? "ok" : "warn",
        at: new Date(row.replied_at),
        href: "/dashboard/follow-up-replies",
      });
    }
    for (const row of recentRxRes.data ?? []) {
      const r = row as { id: string; patient_name: string; created_at: string };
      activityItems.push({
        id: `rx-${r.id}`,
        name: r.patient_name,
        tag: "処方受信",
        variant: "info",
        at: new Date(r.created_at),
        href: "/dashboard/prescription-requests",
      });
    }
    for (const c of recentChatRes.data ?? []) {
      const row = c as unknown as {
        id: string;
        created_at: string;
        read_at: string | null;
        sender: string;
        patient_id: string;
        patients?: { name: string } | { name: string }[] | null;
      };
      if (row.sender !== "patient") continue;
      activityItems.push({
        id: `c-${row.id}`,
        name: patientNameFromJoin(row),
        tag: row.read_at ? "返信済み" : "未読",
        variant: row.read_at ? "ok" : "warn",
        at: new Date(row.created_at),
        href: `/dashboard/chat/${row.patient_id}`,
      });
    }

    activityItems.sort((a, b) => b.at.getTime() - a.at.getTime());
  }

  const activityTop = activityItems.slice(0, 6);

  const statCards = [
    {
      href: "/dashboard/patients",
      label: "患者数",
      sub: "登録済み患者",
      value: patientsCount,
      icon: Users,
      tone: "blue" as const,
      chip: null as null | { text: string; variant: "ok" | "warn" },
    },
    {
      href: "/dashboard/prescription-requests",
      label: "受信処方箋",
      sub: null,
      value: prescriptionRequestsCount,
      icon: FileImage,
      tone: "orange" as const,
      chip:
        prescriptionRequestsCount > 0
          ? ({ text: "要対応", variant: "warn" } as const)
          : ({ text: "問題なし", variant: "ok" } as const),
    },
    {
      href: "/dashboard/follow-up-replies",
      label: "未確認の返信",
      sub: null,
      value: uncheckedReplies,
      icon: Bell,
      tone: "green" as const,
      chip:
        uncheckedReplies > 0
          ? ({ text: "要確認", variant: "warn" } as const)
          : ({ text: "問題なし", variant: "ok" } as const),
    },
    {
      href: "/dashboard/chat",
      label: "未読メッセージ",
      sub: null,
      value: unreadChats,
      icon: MessageSquare,
      tone: "neutral" as const,
      chip:
        unreadChats > 0
          ? ({ text: "未読あり", variant: "warn" } as const)
          : ({ text: "問題なし", variant: "ok" } as const),
    },
  ];

  const toneIconBg = {
    blue: "rgba(59, 130, 246, 0.12)",
    orange: "rgba(255, 112, 25, 0.14)",
    green: "rgba(48, 164, 108, 0.14)",
    neutral: "rgba(100, 116, 139, 0.12)",
  };
  const toneIconFg = {
    blue: "#2563eb",
    orange: "var(--dashboard-accent)",
    green: "var(--color-success)",
    neutral: "#475569",
  };
  const toneValueColor = {
    blue: "#2563eb",
    orange: "var(--dashboard-accent)",
    green: "var(--color-success)",
    neutral: "var(--text-primary)",
  };

  const chipStyle = (variant: "ok" | "warn") =>
    variant === "warn"
      ? {
          backgroundColor: "var(--color-warning-subtle)",
          color: "var(--color-warning)",
        }
      : {
          backgroundColor: "var(--color-success-subtle)",
          color: "var(--color-success)",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            ダッシュボード
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            今日の状況をひと目で確認
          </p>
        </div>
        <div
          className="inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          {dateLabel}
        </div>
      </div>

      {tenantId && prescriptionRequestsCount > 0 ? (
        <div
          className="flex flex-col gap-4 rounded-2xl border-2 border-[var(--dashboard-accent)] bg-[var(--bg-surface)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          style={{ boxShadow: "var(--dashboard-card-shadow)" }}
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--color-warning-subtle)",
                color: "var(--dashboard-accent)",
              }}
            >
              <Inbox size={22} strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                受信処方箋が{prescriptionRequestsCount}件あります
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                未処理の処方箋を確認してください
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/prescription-requests"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            style={{ backgroundColor: "var(--dashboard-accent)" }}
          >
            確認する
            <ChevronRight size={18} />
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="block rounded-2xl p-5 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--dashboard-card-shadow)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)]">{card.label}</p>
                  {card.chip ? (
                    <span
                      className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={chipStyle(card.chip.variant)}
                    >
                      {card.chip.text}
                    </span>
                  ) : null}
                </div>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: toneIconBg[card.tone],
                    color: toneIconFg[card.tone],
                  }}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </span>
              </div>
              <p
                className="mt-4 text-3xl font-bold tabular-nums tracking-tight"
                style={{ color: toneValueColor[card.tone] }}
              >
                {card.value}
              </p>
              {card.sub ? (
                <p className="mt-1 text-xs text-[var(--text-muted)]">{card.sub}</p>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
          style={{ boxShadow: "var(--dashboard-card-shadow)" }}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              今日の送信予定
            </h3>
            <Link
              href="/dashboard/handover/schedules"
              className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--dashboard-accent)] hover:underline"
            >
              すべて見る
              <ChevronRight size={14} />
            </Link>
          </div>
          {!tenantId || scheduleRows.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Calendar
                className="mb-3 opacity-30"
                size={40}
                strokeWidth={1.25}
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-sm text-[var(--text-muted)]">
                本日の送信予定はありません
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {scheduleRows.map((row) => {
                const name = Array.isArray(row.patients)
                  ? row.patients[0]?.name ?? "患者"
                  : row.patients?.name ?? "患者";
                const t = new Date(row.scheduled_at).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Tokyo",
                });
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-subtle)] px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium text-[var(--text-primary)]">{name}</span>
                    <span className="tabular-nums text-[var(--text-muted)]">{t}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
          style={{ boxShadow: "var(--dashboard-card-shadow)" }}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              最近のアクティビティ
            </h3>
            <Link
              href="/dashboard/follow-up-replies"
              className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--dashboard-accent)] hover:underline"
            >
              すべて見る
              <ChevronRight size={14} />
            </Link>
          </div>
          {!tenantId || activityTop.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <MessageSquare
                className="mb-3 opacity-30"
                size={40}
                strokeWidth={1.25}
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-sm text-[var(--text-muted)]">
                直近のアクティビティはありません
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {activityTop.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[var(--bg-subtle)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatRelativeJa(item.at)}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={chipStyle(item.variant === "info" ? "ok" : item.variant)}
                    >
                      {item.tag}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
