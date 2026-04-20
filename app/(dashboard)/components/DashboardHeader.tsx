"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Bell, MoreHorizontal } from "lucide-react";

const ROUTE_TITLES: [string, string][] = [
  ["/dashboard/settings", "設定"],
  ["/dashboard/prescription-requests", "受信処方箋"],
  ["/dashboard/follow-up-patterns/new", "フォローアップ文例の登録"],
  ["/dashboard/follow-up-patterns", "フォローアップ文例・登録"],
  ["/dashboard/follow-up-replies", "フォローアップ返信内容確認"],
  ["/dashboard/handover/schedules", "送信予定一覧"],
  ["/dashboard/handover", "フォローアップ実施入力"],
  ["/dashboard/broadcast", "一斉送信"],
  ["/dashboard/patients/new", "患者の登録"],
  ["/dashboard/patients", "患者一覧"],
  ["/dashboard/chat", "チャット"],
  ["/dashboard", "ダッシュボード"],
];

function pageTitleFromPath(pathname: string): string {
  const hit = ROUTE_TITLES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (hit) return hit[1];
  if (pathname.startsWith("/dashboard/patients/")) return "患者詳細";
  if (pathname.startsWith("/dashboard/follow-up-patterns/")) return "フォローアップ文例の編集";
  if (pathname.startsWith("/dashboard/chat/")) return "チャット";
  return "ダッシュボード";
}

export function DashboardHeader({ tenantName }: { tenantName: string }) {
  const pathname = usePathname() ?? "/dashboard";
  const pageTitle = pageTitleFromPath(pathname);

  return (
    <header
      className="flex-shrink-0 border-b px-6 py-3.5 md:px-8"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="パンくず" className="min-w-0 text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 text-[var(--text-muted)]">
            <li className="truncate font-medium text-[var(--text-secondary)]">
              {tenantName}
            </li>
            <li aria-hidden>›</li>
            <li className="truncate text-[var(--text-primary)]">{pageTitle}</li>
          </ol>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/handover"
            className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95"
            style={{ backgroundColor: "var(--dashboard-accent)" }}
          >
            <MessageCircle size={18} strokeWidth={2} />
            <span className="hidden sm:inline">LINEフォローアップ</span>
          </Link>
          <Link
            href="/dashboard/follow-up-replies"
            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--bg-subtle)]"
            style={{
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
            aria-label="フォローアップ返信"
          >
            <Bell size={20} strokeWidth={1.75} />
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--bg-subtle)]"
            style={{
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
            aria-label="その他・設定"
          >
            <MoreHorizontal size={20} strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
}
