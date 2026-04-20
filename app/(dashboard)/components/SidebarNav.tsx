"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Pill,
  MessageSquare,
  FileImage,
  Settings,
  Megaphone,
  Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "患者一覧", icon: Users },
  { href: "/dashboard/follow-up-patterns", label: "フォローアップ文例・登録", icon: ClipboardList },
  { href: "/dashboard/handover", label: "フォローアップ実施入力", icon: Pill },
  { href: "/dashboard/follow-up-replies", label: "フォローアップ返信内容確認", icon: Bell },
  { href: "/dashboard/chat", label: "チャット", icon: MessageSquare, unreadKey: "chat" as const },
  { href: "/dashboard/broadcast", label: "一斉送信", icon: Megaphone },
  { href: "/dashboard/prescription-requests", label: "受信処方箋", icon: FileImage },
  { href: "/dashboard/settings", label: "設定", icon: Settings },
];

export function SidebarNav({
  tenantId,
  initialUnread,
}: {
  tenantId: string | null;
  initialUnread: number;
}) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(initialUnread);

  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/chat")) setUnread(0);
  }, [pathname]);

  useEffect(() => {
    if (!tenantId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`sidebar-unread-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "terastar_line",
          table: "chat_messages",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as { sender?: string };
          if (row.sender !== "patient") return;
          if (window.location.pathname.startsWith("/dashboard/chat")) return;
          setUnread((n) => n + 1);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  return (
    <nav className="flex-1 overflow-y-auto py-3">
      <ul className="space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const badge = item.unreadKey === "chat" && unread > 0 ? unread : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                title={item.label}
                className={`
                  group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? "bg-white/[0.12] text-white shadow-sm"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                  }
                `}
                style={
                  isActive
                    ? {
                        boxShadow: "inset 3px 0 0 0 var(--dashboard-accent)",
                      }
                    : { boxShadow: "inset 3px 0 0 0 transparent" }
                }
              >
                <span
                  className={`
                    flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors
                    ${isActive
                      ? "bg-[var(--dashboard-accent)]/25 text-[var(--dashboard-accent)]"
                      : "bg-white/[0.06] text-white/70 group-hover:text-white/90"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.1 : 1.65} absoluteStrokeWidth />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {badge > 0 && (
                  <span
                    className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--color-error)" }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
