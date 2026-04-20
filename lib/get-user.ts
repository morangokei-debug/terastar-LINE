import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * 同一リクエスト内で何度呼ばれても Supabase への認証チェックは1回だけ。
 * middleware で既に検証済みのため、ここはユーザー情報取得が主目的。
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});
