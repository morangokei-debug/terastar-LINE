"use client";

import { LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function Sidebar({ userName }: { userName?: string }) {
  return (
    <aside
      className="flex w-64 flex-shrink-0 flex-col border-r"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      {/* ユーザーエリア */}
      <div className="border-b px-4 py-5" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-md ring-2 ring-white/30"
            style={{
              background: "linear-gradient(145deg, #7b86eb 0%, #5e6ad2 45%, #4349a8 100%)",
            }}
          >
            {userName?.charAt(0) ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {userName ?? "薬剤師"}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
              テラスターファーマシー
            </p>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <SidebarNav />

      {/* ログアウト */}
      <div className="border-t p-4" style={{ borderColor: "var(--border-default)" }}>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-[background-color,color] duration-150 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <LogOut size={19} strokeWidth={1.65} absoluteStrokeWidth />
            <span>ログアウト</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
