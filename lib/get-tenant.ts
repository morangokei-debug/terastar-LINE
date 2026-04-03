import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * 同一リクエスト内で何度呼ばれても DB クエリは1回だけ実行される。
 * React の cache() により自動的にメモ化される。
 */
export const getTenant = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("terastar_line")
    .from("tenants")
    .select("id, name")
    .limit(1)
    .single();
  return data ?? null;
});
