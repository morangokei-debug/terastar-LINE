"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function Sidebar({
  userName,
  tenantName,
  tenantId,
  initialUnread,
}: {
  userName?: string;
  tenantName: string;
  tenantId?: string | null;
  initialUnread?: number;
}) {
  return (
    <aside
      className="flex w-64 flex-shrink-0 flex-col"
      style={{
        backgroundColor: "var(--dashboard-sidebar-bg)",
        borderRight: "1px solid var(--dashboard-sidebar-border)",
      }}
    >
      <div
        className="flex items-center gap-3 border-b px-4 py-5"
        style={{ borderColor: "var(--dashboard-sidebar-border)" }}
      >
        <Link
          href="/dashboard"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--dashboard-accent)" }}
          aria-label="ダッシュボードへ"
        >
          T
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-white/50">
            Terastar
          </p>
          <p className="truncate text-sm font-semibold text-white/95">{tenantName}</p>
        </div>
      </div>

      <SidebarNav tenantId={tenantId ?? null} initialUnread={initialUnread ?? 0} />

      <div
        className="mt-auto border-t px-3 py-3"
        style={{ borderColor: "var(--dashboard-sidebar-border)" }}
      >
        <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }}
          >
            {userName?.charAt(0) ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white/90">
              {userName ?? "薬剤師"}
            </p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.65} absoluteStrokeWidth />
            <span>ログアウト</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
