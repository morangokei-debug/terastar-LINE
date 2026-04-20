import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { DashboardHeader } from "./components/DashboardHeader";
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
    <div className="dashboard-app flex min-h-screen">
      <Sidebar
        userName={userName}
        tenantName={tenant?.name ?? "テラスターファーマシー"}
        tenantId={tenant?.id ?? null}
        initialUnread={initialUnread}
      />
      <main
        className="flex min-w-0 flex-1 flex-col overflow-auto"
        style={{ backgroundColor: "#eef0f4" }}
      >
        <DashboardHeader tenantName={tenant?.name ?? "テラスターファーマシー"} />
        <div className="flex-1 p-5 md:p-8">{children}</div>
      </main>
      <FullscreenButton />
    </div>
  );
}
