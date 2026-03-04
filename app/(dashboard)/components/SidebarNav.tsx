"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
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
  { href: "/dashboard/prescriptions", label: "処方箋一覧", icon: FileText },
  { href: "/dashboard/follow-up-patterns", label: "フォローアップパターン", icon: ClipboardList },
  { href: "/dashboard/handover", label: "薬渡し入力", icon: Pill },
  { href: "/dashboard/follow-up-replies", label: "フォロー返信", icon: Bell },
  { href: "/dashboard/chat", label: "チャット", icon: MessageSquare },
  { href: "/dashboard/broadcast", label: "一斉送信", icon: Megaphone },
  { href: "/dashboard/prescription-requests", label: "処方箋リクエスト", icon: Inbox },
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
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                  ${isActive
                    ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]"
                    : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-bg-hover)] hover:text-white"
                  }
                `}
                style={
                  isActive
                    ? { borderLeft: "3px solid var(--sidebar-active-border)", marginLeft: "-3px" }
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
