import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ユーザーIDをキーにして5分間サーバーサイドキャッシュする
// ユーザーごとに別キャッシュになるのでセキュリティ上安全
const _fetchTenant = unstable_cache(
  async (_userId: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .schema("terastar_line")
      .from("tenants")
      .select("id, name")
      .limit(1)
      .single();
    return data ?? null;
  },
  ["tenant"],
  { revalidate: 300 }
);

/**
 * 同一リクエスト内では1回のみ実行（React cache）
 * リクエスト間では5分間キャッシュ（Next.js unstable_cache）
 */
export const getTenant = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return _fetchTenant(user.id);
});
