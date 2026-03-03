import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside
        className="w-64 flex-shrink-0 border-r flex flex-col"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="font-bold text-lg">テラスター薬局</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">LINEフォローアップ</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="block px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ダッシュボード
          </Link>
          <Link
            href="/dashboard/patients"
            className="block px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            患者一覧
          </Link>
          <Link
            href="/dashboard/prescriptions"
            className="block px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            処方箋一覧
          </Link>
          <Link
            href="/dashboard/follow-up-patterns"
            className="block px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            フォローアップパターン
          </Link>
          <Link
            href="/dashboard/handover"
            className="block px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            薬渡し入力
          </Link>
          <Link
            href="/dashboard/chat"
            className="block px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            チャット
          </Link>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              ログアウト
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
