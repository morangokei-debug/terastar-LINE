import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { FullscreenButton } from "./components/FullscreenButton";

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

  const userName =
    data.user.user_metadata?.full_name ??
    data.user.email?.split("@")[0] ??
    undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} />
      <main
        className="flex flex-1 flex-col overflow-auto"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {/* ヘッダーバー（参考UIのトップバー風） */}
        <header
          className="flex-shrink-0 border-b px-8 py-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              テラスターファーマシー
            </h1>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              LINEフォローアップ
            </span>
          </div>
        </header>
        <div className="flex-1 p-8">{children}</div>
      </main>
      <FullscreenButton />
    </div>
  );
}
