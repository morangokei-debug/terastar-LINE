import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function FollowUpPatternsPage() {
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .select("id")
    .limit(1)
    .single();

  if (!tenant) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-8">フォローアップパターン</h1>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">フォローアップパターン</h1>
        <Link
          href="/dashboard/follow-up-patterns/new"
          className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[0.99] active:scale-[0.97]"
          style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
        >
          新規登録
        </Link>
      </div>

      {!patterns?.length ? (
        <div
          className="p-12 rounded-xl text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[var(--text-muted)] mb-4">パターンがまだ登録されていません</p>
          <Link
            href="/dashboard/follow-up-patterns/new"
            className="inline-block px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
          >
            最初のパターンを登録する
          </Link>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">パターン名</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">送信日数</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">文例</th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
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
