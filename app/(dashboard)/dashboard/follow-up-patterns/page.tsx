import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/get-tenant";
import Link from "next/link";

export default async function FollowUpPatternsPage() {
  const supabase = await createClient();
  const tenant = await getTenant();

  if (!tenant) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-bold tracking-tight">フォローアップ文例・登録</h1>
        <p className="text-[var(--text-muted)]">テナントが登録されていません。</p>
      </div>
    );
  }

  const { data: patterns } = await supabase
    .schema("terastar_line")
    .from("follow_up_patterns")
    .select("id, name, days_after, message_template, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">フォローアップ文例・登録</h1>
        <Link
          href="/dashboard/follow-up-patterns/new"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          新規登録
        </Link>
      </div>

      {!patterns?.length ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--dashboard-card-shadow)",
          }}
        >
          <p className="text-[var(--text-muted)] mb-4">パターンがまだ登録されていません</p>
          <Link
            href="/dashboard/follow-up-patterns/new"
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            最初のパターンを登録する
          </Link>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--dashboard-card-shadow)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">パターン名</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">送信日数</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">文例</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.id}>
                  <td className="py-4 px-6 font-medium">{p.name}</td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {p.days_after}日後
                  </td>
                  <td className="py-4 px-6 text-sm text-[var(--text-muted)] max-w-xs truncate">
                    {p.message_template ?? "—"}
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/dashboard/follow-up-patterns/${p.id}/edit`}
                      className="text-sm"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
