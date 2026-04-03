"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "患者一覧", icon: Users },
  { href: "/dashboard/follow-up-patterns", label: "フォローアップ文例・登録", icon: ClipboardList },
  { href: "/dashboard/handover", label: "フォローアップ実施入力", icon: Pill },
  { href: "/dashboard/follow-up-replies", label: "フォローアップ返信内容確認", icon: Bell },
  { href: "/dashboard/chat", label: "チャット", icon: MessageSquare },
  { href: "/dashboard/broadcast", label: "一斉送信", icon: Megaphone },
  { href: "/dashboard/prescription-requests", label: "受信処方箋", icon: FileImage },
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
                  flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-150
                  ${isActive
                    ? "bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  }
                `}
                style={
                  isActive
                    ? { borderLeft: "3px solid var(--accent)", marginLeft: "-3px" }
                    : undefined
                }
              >
                <span
                  className={`
                    flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors
                    ${isActive ? "bg-white/90 text-[var(--accent)] shadow-sm" : "bg-[var(--bg-subtle)] text-current"}
                  `}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.15 : 1.65} absoluteStrokeWidth />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
