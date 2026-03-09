"use client";

import { LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function Sidebar({ userName }: { userName?: string }) {
  return (
    <aside
      className="flex w-64 flex-shrink-0 flex-col"
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* ユーザーエリア */}
      <div className="border-b px-4 py-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
              color: "white",
              boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)",
            }}
          >
            {userName?.charAt(0) ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {userName ?? "薬剤師"}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--sidebar-text)" }}>
              テラスターファーマシー
            </p>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <SidebarNav />

      {/* ログアウト */}
      <div className="border-t p-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-bg-hover)] hover:text-white"
          >
            <LogOut size={18} strokeWidth={2} />
            <span>ログアウト</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
