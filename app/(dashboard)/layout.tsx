import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { FullscreenButton } from "./components/FullscreenButton";
import { getCurrentUser } from "@/lib/get-user";
import { getTenant } from "@/lib/get-tenant";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    undefined;

  const tenant = await getTenant();
  let initialUnread = 0;
  if (tenant) {
    const supabase = await createClient();
    const { count } = await supabase
      .schema("terastar_line")
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("sender", "patient")
      .is("read_at", null);
    initialUnread = count ?? 0;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={userName}
        tenantId={tenant?.id ?? null}
        initialUnread={initialUnread}
      />
        <main
        className="flex flex-1 flex-col overflow-auto"
        style={{ backgroundColor: "var(--bg-app)" }}
      >
        {/* ヘッダーバー */}
        <header
          className="flex-shrink-0 border-b px-8 py-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
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
