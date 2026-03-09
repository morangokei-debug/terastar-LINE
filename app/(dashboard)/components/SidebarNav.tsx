"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Pill,
  MessageSquare,
  Inbox,
  Settings,
  Megaphone,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "患者一覧", icon: Users },
  { href: "/dashboard/follow-up-patterns", label: "フォローアップ文例・登録", icon: ClipboardList },
  { href: "/dashboard/handover", label: "フォローアップ実施入力", icon: Pill },
  { href: "/dashboard/follow-up-replies", label: "フォローアップ返信内容確認", icon: Bell },
  { href: "/dashboard/chat", label: "チャット", icon: MessageSquare },
  { href: "/dashboard/broadcast", label: "一斉送信", icon: Megaphone },
  { href: "/dashboard/prescription-requests", label: "受信処方箋", icon: Inbox },
  { href: "/dashboard/settings", label: "設定", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]"
                    : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-bg-hover)] hover:text-white"
                  }
                `}
                style={
                  isActive
                    ? { borderLeft: "3px solid var(--sidebar-active-border)", marginLeft: "-3px", boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.08)" }
                    : undefined
                }
              >
                <Icon size={18} strokeWidth={2} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
